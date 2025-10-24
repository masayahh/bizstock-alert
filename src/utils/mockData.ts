/**
 * Mock Data Utilities
 *
 * Generate realistic mock data for testing without API keys.
 * Useful for UI development and integration testing.
 */

import { v4 as uuidv4 } from 'uuid';

import {
  ClusteredEvent,
  EventType,
  ImpactLevel,
  NormalizedEvent,
  PersonalizedEvent,
  SourceTier,
} from '../types/events';

/**
 * Sample company names and tickers
 */
const SAMPLE_COMPANIES = [
  { ticker: '7203', name: 'トヨタ自動車' },
  { ticker: '6758', name: 'ソニーグループ' },
  { ticker: '9984', name: 'ソフトバンクグループ' },
  { ticker: '6861', name: 'キーエンス' },
  { ticker: '9983', name: 'ファーストリテイリング' },
  { ticker: '8306', name: '三菱UFJフィナンシャル・グループ' },
  { ticker: '4063', name: '信越化学工業' },
  { ticker: '6098', name: 'リクルートホールディングス' },
];

/**
 * Sample event titles by type
 */
const SAMPLE_TITLES: Record<EventType, string[]> = {
  上方修正: [
    '2024年3月期 業績予想の上方修正に関するお知らせ',
    '通期業績予想の修正（上方修正）について',
    '2024年度第2四半期決算短信における業績予想の上方修正',
  ],
  資本政策: [
    '自己株式の取得に係る事項の決定に関するお知らせ',
    '株式分割に関するお知らせ',
    '第三者割当による新株式の発行に関するお知らせ',
  ],
  提携: [
    '業務提携契約の締結に関するお知らせ',
    '資本業務提携契約の締結について',
    '戦略的提携に関する基本合意書の締結について',
  ],
  事故: [
    '工場における火災事故の発生について',
    '製品の自主回収に関するお知らせ',
    '情報セキュリティインシデントの発生について',
  ],
  規制: [
    '金融庁による業務改善命令の受領について',
    '独占禁止法違反に係る公正取引委員会からの警告について',
    '環境規制への対応方針について',
  ],
  決算発表: [
    '2024年3月期 決算短信〔日本基準〕（連結）',
    '2024年度第2四半期決算短信',
    '2024年12月期 第3四半期決算短信',
  ],
  業績予想: [
    '2024年度通期業績予想の開示について',
    '業績予想の修正に関するお知らせ',
    '次期業績予想に関するお知らせ',
  ],
  新製品: [
    '新製品の発売に関するお知らせ',
    '次世代製品ラインナップの発表について',
    '新サービスの提供開始について',
  ],
  受注: [
    '大型プロジェクト受注に関するお知らせ',
    '海外案件の受注について',
    '官公庁向けシステム受注のお知らせ',
  ],
  その他: [
    '代表取締役の異動に関するお知らせ',
    '組織変更に関するお知らせ',
    '新規事業参入に関するお知らせ',
  ],
};

/**
 * Generate a random date within the last N days
 */
function randomRecentDate(daysAgo = 3): string {
  const now = new Date();
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  const date = new Date(now.getTime() - offset);
  return date.toISOString();
}

/**
 * Pick a random item from an array
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a mock normalized event
 */
export function generateMockNormalizedEvent(
  overrides?: Partial<NormalizedEvent>,
): NormalizedEvent {
  const company = randomPick(SAMPLE_COMPANIES);
  const eventType = randomPick<EventType>([
    '上方修正',
    '資本政策',
    '提携',
    '決算発表',
    '業績予想',
    '新製品',
    '受注',
  ]);
  const tier = randomPick<SourceTier>(['A', 'B']);
  const title = randomPick(SAMPLE_TITLES[eventType]);

  return {
    id: uuidv4(),
    tier,
    title,
    url: `https://example.com/ir/${company.ticker}/${uuidv4()}`,
    publishedAt: randomRecentDate(2),
    fetchedAt: new Date().toISOString(),
    tickerCodes: [company.ticker],
    eventType,
    sourceName: tier === 'A' ? 'EDINET' : 'PR TIMES',
    excerpt: `${company.name}は${title.slice(0, 30)}...`,
    ...overrides,
  };
}

/**
 * Generate a mock clustered event
 */
export function generateMockClusteredEvent(
  overrides?: Partial<ClusteredEvent>,
): ClusteredEvent {
  const normalizedEvent = generateMockNormalizedEvent();
  const impact = randomPick<ImpactLevel>(['強', '中', '弱']);

  return {
    clusterId: uuidv4(),
    events: [normalizedEvent],
    primaryTicker: normalizedEvent.tickerCodes[0],
    allTickers: normalizedEvent.tickerCodes,
    title: normalizedEvent.title,
    impact,
    eventType: normalizedEvent.eventType,
    publishedAt: normalizedEvent.publishedAt,
    sources: [normalizedEvent.sourceName],
    summary: `${normalizedEvent.title.slice(0, 100)}の要約。影響度${impact}と判断。`,
    reasoning: `ソース: ${normalizedEvent.sourceName}、イベント種別: ${normalizedEvent.eventType}`,
    ...overrides,
  };
}

/**
 * Generate a mock personalized event
 */
export function generateMockPersonalizedEvent(
  overrides?: Partial<PersonalizedEvent>,
): PersonalizedEvent {
  const clusteredEvent = generateMockClusteredEvent();
  const relevanceScore = Math.floor(Math.random() * 60) + 40; // 40-100
  const personalImpact =
    relevanceScore >= 80 ? '強' : relevanceScore >= 60 ? '中' : '弱';

  return {
    ...clusteredEvent,
    relevanceScore,
    personalImpact,
    scoreReason: `ウォッチリスト銘柄: ${clusteredEvent.primaryTicker}; 影響度: ${clusteredEvent.impact} (+${Math.floor(Math.random() * 20)}pt)`,
    ...overrides,
  };
}

/**
 * Generate multiple mock personalized events
 */
export function generateMockPersonalizedEvents(
  count: number,
  watchlistTickers: string[] = ['7203', '6758', '9984'],
): PersonalizedEvent[] {
  const events: PersonalizedEvent[] = [];

  for (let i = 0; i < count; i++) {
    const ticker = randomPick(watchlistTickers);
    const company = SAMPLE_COMPANIES.find((c) => c.ticker === ticker);

    if (company) {
      const event = generateMockPersonalizedEvent({
        primaryTicker: ticker,
        allTickers: [ticker],
      });

      // Patch title to use correct company name
      const eventType = event.eventType;
      const titleTemplate = randomPick(SAMPLE_TITLES[eventType]);
      event.title = `【${company.name}】${titleTemplate}`;
      event.summary = `${company.name}が${titleTemplate.slice(0, 50)}を発表。詳細は出典をご確認ください。`;

      events.push(event);
    }
  }

  return events;
}

/**
 * Generate mock events for live tiles (top 3-5)
 */
export function generateMockLiveTileEvents(
  watchlistTickers: string[] = ['7203', '6758', '9984'],
): PersonalizedEvent[] {
  const events = generateMockPersonalizedEvents(3, watchlistTickers);

  // Ensure at least one high-impact event
  events[0].impact = '強';
  events[0].personalImpact = '強';
  events[0].relevanceScore = 95;

  return events;
}

/**
 * Generate mock events for digest (morning/midday/closing)
 */
export function generateMockDigestEvents(
  watchlistTickers: string[] = ['7203', '6758', '9984'],
): PersonalizedEvent[] {
  return generateMockPersonalizedEvents(8, watchlistTickers);
}

/**
 * Check if mock mode is enabled (for testing without API keys)
 */
export function isMockMode(): boolean {
  // Mock mode is enabled if OPENAI_API_KEY is not set
  // or if explicitly enabled via environment variable
  return (
    process.env.EXPO_PUBLIC_MOCK_MODE === 'true' ||
    !process.env.EXPO_PUBLIC_OPENAI_API_KEY
  );
}
