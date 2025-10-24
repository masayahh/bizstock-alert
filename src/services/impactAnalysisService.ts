/**
 * Impact Analysis Service
 *
 * Per product spec:
 * - Outlook pill (上向き/弱含み/不確定)
 * - Impact level (強/中/弱) based on source tier
 * - Reasoning (要因タグ付き) and counter-reasoning (反証)
 * - Score/confidence for internal use
 */

import { callOpenAIWithRetry, isAIInitialized } from './aiService';
import { checkForbiddenWords } from './summaryService';
import { NormalizedEvent, ImpactLevel, SourceTier } from '../types/events';

/**
 * Outlook types per product spec
 */
export type OutlookType = '上向き' | '弱含み' | '不確定';

/**
 * Factor tags per product spec
 */
export type FactorTag =
  | '金利'
  | '為替'
  | '資金調達'
  | '規制'
  | '受注'
  | '業績'
  | '提携'
  | 'その他';

/**
 * Impact analysis result
 */
export interface ImpactAnalysis {
  /** Outlook pill */
  outlook: OutlookType;
  /** Impact level */
  impact: ImpactLevel;
  /** Reasoning (1-2 lines) */
  reasoning: string;
  /** Factor tags */
  factors: FactorTag[];
  /** Counter-reasoning (1-2 lines) */
  counterReasoning: string;
  /** Confidence score (0-1, internal use) */
  confidence: number;
  /** Whether this is a failsafe/default analysis */
  isFailsafe: boolean;
  /** Validation warnings */
  warnings: string[];
}

/**
 * Analyze event impact
 * Per product spec: AI-based analysis with guardrails
 *
 * @param event - Normalized event
 * @param summary - Event summary (optional, improves analysis)
 * @returns Impact analysis
 */
export async function analyzeImpact(
  event: NormalizedEvent,
  summary?: string,
): Promise<ImpactAnalysis> {
  // Determine base impact from source tier
  // Per product spec: A or (B×2) → 強
  const baseImpact = determineBaseImpact(event.tier);

  // If AI not initialized, return tier-based analysis
  if (!isAIInitialized()) {
    return {
      outlook: '不確定',
      impact: baseImpact,
      reasoning: 'イベントの影響を分析中',
      factors: [eventTypeToFactor(event.eventType)],
      counterReasoning: '詳細は出典をご確認ください',
      confidence: 0.5,
      isFailsafe: true,
      warnings: ['AI service not initialized'],
    };
  }

  try {
    const systemPrompt = buildImpactSystemPrompt();
    const userMessage = buildImpactUserMessage(event, summary);

    const response = await callOpenAIWithRetry({
      systemPrompt,
      userMessage,
      temperature: 0.3, // Slightly higher for reasoning
      maxTokens: 300,
    });

    const analysis = parseImpactResponse(response.text);

    // Validate
    const warnings: string[] = [];

    // Check for forbidden words
    const forbiddenInReasoning = checkForbiddenWords(analysis.reasoning);
    const forbiddenInCounter = checkForbiddenWords(analysis.counterReasoning);

    if (forbiddenInReasoning.length > 0 || forbiddenInCounter.length > 0) {
      warnings.push(
        `Forbidden words found in reasoning: ${[...forbiddenInReasoning, ...forbiddenInCounter].join(', ')}`,
      );
      // Override impact to base tier level if forbidden words detected
      analysis.impact = baseImpact;
    }

    // Ensure impact doesn't exceed tier-based maximum
    analysis.impact = enforceMaxImpact(analysis.impact, event.tier);

    return {
      ...analysis,
      warnings,
    };
  } catch (error) {
    console.error('Impact analysis failed:', error);
    return {
      outlook: '不確定',
      impact: baseImpact,
      reasoning: 'イベントの影響を分析中',
      factors: [eventTypeToFactor(event.eventType)],
      counterReasoning: '詳細は出典をご確認ください',
      confidence: 0.3,
      isFailsafe: true,
      warnings: [`Error: ${error}`],
    };
  }
}

/**
 * Determine base impact from source tier
 * Per product spec: A → 強, B → 中, C → 弱
 */
function determineBaseImpact(tier: SourceTier): ImpactLevel {
  switch (tier) {
    case 'A':
      return '強';
    case 'B':
      return '中';
    case 'C':
      return '弱';
  }
}

/**
 * Enforce maximum impact based on source tier
 * Per product spec: Cannot exceed tier-based maximum
 */
function enforceMaxImpact(impact: ImpactLevel, tier: SourceTier): ImpactLevel {
  const maxImpact = determineBaseImpact(tier);

  const impactOrder: ImpactLevel[] = ['弱', '中', '強'];
  const currentIndex = impactOrder.indexOf(impact);
  const maxIndex = impactOrder.indexOf(maxImpact);

  if (currentIndex > maxIndex) {
    return maxImpact;
  }

  return impact;
}

/**
 * Map event type to factor tag
 */
function eventTypeToFactor(eventType: string): FactorTag {
  const mapping: Record<string, FactorTag> = {
    上方修正: '業績',
    資本政策: '資金調達',
    提携: '提携',
    規制: '規制',
    受注: '受注',
    決算発表: '業績',
    業績予想: '業績',
  };

  return mapping[eventType] || 'その他';
}

/**
 * Build system prompt for impact analysis
 */
function buildImpactSystemPrompt(): string {
  return `あなたは日本株の投資イベント影響分析AIです。以下のルールに従ってください：

1. 見通し: 上向き/弱含み/不確定 のいずれかを選択
2. 理由: 影響の要因を1行で簡潔に（要因タグ: 金利/為替/資金調達/規制/受注/業績/提携）
3. 反証: リスクや不確定要素を1行で
4. 推測語は使わない（「〜だろう」等は禁止）
5. 売買推奨や価格目標は絶対に含めない

出力形式（必ずこの形式で）:
見通し: [上向き/弱含み/不確定]
理由: [要因を1行で]
要因: [金利/為替/資金調達/規制/受注/業績/提携/その他]
反証: [リスクを1行で]
信頼度: [0.0-1.0]`;
}

/**
 * Build user message for impact analysis
 */
function buildImpactUserMessage(
  event: NormalizedEvent,
  summary?: string,
): string {
  return `以下のイベントの影響を分析してください：

タイトル: ${event.title}
種別: ${event.eventType}
出典ティア: ${event.tier === 'A' ? '一次（EDINET等）' : event.tier === 'B' ? '準一次（IR/PR）' : '報道'}
${summary ? `要約: ${summary}` : ''}
${event.excerpt ? `詳細: ${event.excerpt}` : ''}

影響分析:`;
}

/**
 * Parse AI response into structured impact analysis
 */
function parseImpactResponse(response: string): ImpactAnalysis {
  const lines = response.split('\n').map((l) => l.trim());

  let outlook: OutlookType = '不確定';
  let reasoning = '';
  let factors: FactorTag[] = [];
  let counterReasoning = '';
  let confidence = 0.5;

  for (const line of lines) {
    if (line.startsWith('見通し:')) {
      const value = line.replace('見通し:', '').trim();
      if (value === '上向き' || value === '弱含み' || value === '不確定') {
        outlook = value;
      }
    } else if (line.startsWith('理由:')) {
      reasoning = line.replace('理由:', '').trim();
    } else if (line.startsWith('要因:')) {
      const factorStr = line.replace('要因:', '').trim();
      factors = parseFactors(factorStr);
    } else if (line.startsWith('反証:')) {
      counterReasoning = line.replace('反証:', '').trim();
    } else if (line.startsWith('信頼度:')) {
      const confStr = line.replace('信頼度:', '').trim();
      confidence = parseFloat(confStr) || 0.5;
    }
  }

  // Fallbacks
  if (!reasoning) reasoning = 'イベントの影響を評価中';
  if (factors.length === 0) factors = ['その他'];
  if (!counterReasoning) counterReasoning = '詳細は出典をご確認ください';

  return {
    outlook,
    impact: '中', // Will be determined by tier
    reasoning,
    factors,
    counterReasoning,
    confidence: Math.max(0, Math.min(1, confidence)),
    isFailsafe: false,
    warnings: [],
  };
}

/**
 * Parse factor tags from string
 */
function parseFactors(factorStr: string): FactorTag[] {
  const validFactors: FactorTag[] = [
    '金利',
    '為替',
    '資金調達',
    '規制',
    '受注',
    '業績',
    '提携',
    'その他',
  ];

  const factors: FactorTag[] = [];

  for (const factor of validFactors) {
    if (factorStr.includes(factor)) {
      factors.push(factor);
    }
  }

  return factors.length > 0 ? factors : ['その他'];
}

/**
 * Batch analyze impact for multiple events
 */
export async function analyzeImpacts(
  events: NormalizedEvent[],
  summaries?: string[],
): Promise<ImpactAnalysis[]> {
  const results: ImpactAnalysis[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const summary = summaries?.[i];

    const analysis = await analyzeImpact(event, summary);
    results.push(analysis);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
