/**
 * Summary Generation Service
 *
 * Per product spec:
 * - 150-250 characters
 * - Facts only, no speculation
 * - No forbidden words (price targets, buy/sell recommendations, etc.)
 * - Numeric consistency (only numbers from source)
 * - Failsafe on error
 */

import {
  callOpenAIWithRetry,
  getFailsafeMessage,
  isAIInitialized,
} from './aiService';
import { NormalizedEvent } from '../types/events';

/**
 * Summary generation result
 */
export interface SummaryResult {
  /** Generated summary (150-250 chars) */
  summary: string;
  /** Whether this is a failsafe message */
  isFailsafe: boolean;
  /** Validation warnings (if any) */
  warnings: string[];
}

/**
 * Forbidden words/phrases per product spec
 * - 断定的助言 (definitive advice)
 * - 価格示唆 (price targets)
 * - 推測語 (speculation)
 */
const FORBIDDEN_WORDS = [
  // Definitive advice
  '買い',
  '売り',
  '推奨',
  'おすすめ',
  'お勧め',
  // Price targets
  '目標株価',
  '予想株価',
  '株価は',
  '値上がり',
  '値下がり',
  // Speculation
  'だろう',
  'でしょう',
  'かもしれない',
  '見込み',
  '予想される',
  'と思われる',
  'と考えられる',
];

/**
 * Generate summary for event
 * Per product spec: 150-250 chars, facts only
 *
 * @param event - Normalized event
 * @returns Summary result
 */
export async function generateSummary(
  event: NormalizedEvent,
): Promise<SummaryResult> {
  // Check if AI is initialized
  if (!isAIInitialized()) {
    return {
      summary: getFailsafeMessage(),
      isFailsafe: true,
      warnings: ['AI service not initialized'],
    };
  }

  try {
    const systemPrompt = buildSummarySystemPrompt();
    const userMessage = buildSummaryUserMessage(event);

    const response = await callOpenAIWithRetry({
      systemPrompt,
      userMessage,
      temperature: 0,
      maxTokens: 200,
    });

    const summary = response.text.trim();

    // Validate summary
    const warnings: string[] = [];

    // Check length (150-250 chars)
    if (summary.length < 150) {
      warnings.push('Summary too short (< 150 chars)');
    } else if (summary.length > 250) {
      warnings.push('Summary too long (> 250 chars)');
    }

    // Check for forbidden words
    const forbiddenFound = checkForbiddenWords(summary);
    if (forbiddenFound.length > 0) {
      warnings.push(`Forbidden words found: ${forbiddenFound.join(', ')}`);
      // Return failsafe if forbidden words detected
      return {
        summary: getFailsafeMessage(),
        isFailsafe: true,
        warnings,
      };
    }

    // Check numeric consistency
    const numericIssues = checkNumericConsistency(event, summary);
    if (numericIssues.length > 0) {
      warnings.push(...numericIssues);
    }

    return {
      summary,
      isFailsafe: false,
      warnings,
    };
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      summary: getFailsafeMessage(),
      isFailsafe: true,
      warnings: [`Error: ${error}`],
    };
  }
}

/**
 * Build system prompt for summary generation
 */
function buildSummarySystemPrompt(): string {
  return `あなたは日本株の投資ニュース要約AIです。以下のルールに厳密に従ってください：

1. 要約は150〜250文字で、事実のみを記載する
2. 推測や意見は一切含めない（「〜だろう」「〜と思われる」等は禁止）
3. 売買推奨や価格目標は絶対に含めない
4. 数値は元の情報に含まれるもののみ使用
5. 投資助言ではなく、事実の整理のみを行う
6. 簡潔で読みやすい日本語を使用

出力形式：要約文のみ（説明や補足は不要）`;
}

/**
 * Build user message for summary generation
 */
function buildSummaryUserMessage(event: NormalizedEvent): string {
  return `以下のイベント情報を要約してください：

タイトル: ${event.title}
出典: ${event.sourceName}
公開日時: ${new Date(event.publishedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
イベント種別: ${event.eventType}
${event.excerpt ? `内容: ${event.excerpt}` : ''}

要約（150〜250文字）:`;
}

/**
 * Check for forbidden words
 * Per product spec: no definitive advice, price targets, speculation
 *
 * @param text - Text to check
 * @returns Array of forbidden words found
 */
export function checkForbiddenWords(text: string): string[] {
  const found: string[] = [];

  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) {
      found.push(word);
    }
  }

  return found;
}

/**
 * Check numeric consistency
 * Per product spec: only numbers from source allowed
 *
 * @param event - Original event
 * @param summary - Generated summary
 * @returns Array of issues found
 */
export function checkNumericConsistency(
  event: NormalizedEvent,
  summary: string,
): string[] {
  const issues: string[] = [];

  // Extract numbers from summary
  const summaryNumbers = extractNumbers(summary);

  // Extract numbers from source (title + excerpt)
  const sourceText = `${event.title} ${event.excerpt || ''}`;
  const sourceNumbers = extractNumbers(sourceText);

  // Check if all numbers in summary exist in source
  for (const num of summaryNumbers) {
    if (!sourceNumbers.includes(num)) {
      issues.push(`Number ${num} in summary not found in source`);
    }
  }

  return issues;
}

/**
 * Extract numbers from text
 */
function extractNumbers(text: string): string[] {
  // Match numbers (including decimal, percentage, etc.)
  const matches = text.match(/\d+(?:\.\d+)?%?/g);
  return matches || [];
}

/**
 * Batch generate summaries for multiple events
 *
 * @param events - Array of events
 * @returns Array of summary results
 */
export async function generateSummaries(
  events: NormalizedEvent[],
): Promise<SummaryResult[]> {
  const results: SummaryResult[] = [];

  for (const event of events) {
    const result = await generateSummary(event);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
