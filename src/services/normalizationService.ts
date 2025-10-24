/**
 * Data Normalization Service
 *
 * Per product spec:
 * - URL normalization for duplicate detection
 * - Title cleanup
 * - Ticker code resolution (aliases, subsidiaries → parent mapping)
 * - Event type classification (dictionary-based, AI extension in Phase 3)
 */

import { RawEvent, NormalizedEvent, EventType } from '../types/events';

/**
 * Event type classification keywords (dictionary-based)
 * Per product spec: 上方修正/資本政策/提携/事故/規制/etc.
 */
const EVENT_TYPE_KEYWORDS: Record<EventType, string[]> = {
  上方修正: ['上方修正', '業績予想の修正', '増益', '上振れ'],
  資本政策: ['自己株式', '株式分割', '増資', '減資', '株式併合', '資本提携'],
  提携: ['業務提携', '資本提携', '合弁', '協業', '連携'],
  事故: ['事故', '不祥事', 'リコール', '流出', '情報漏洩'],
  規制: ['行政処分', '業務改善命令', '課徴金', '規制'],
  決算発表: ['決算', '業績', '財務諸表', '四半期', '期末', '有価証券報告書'],
  業績予想: ['業績予想', '通期予想', '見通し', '業績見込み'],
  新製品: ['新製品', '新商品', '発売', 'リリース'],
  受注: ['受注', '契約', '取引開始'],
  その他: [],
};

/**
 * Company name to ticker code mapping (for subsidiary → parent resolution)
 * In production, this would be a comprehensive database lookup
 */
const COMPANY_TICKER_MAP: Record<string, string> = {
  // Example mappings
  トヨタ自動車: '7203',
  トヨタ: '7203',
  TOYOTA: '7203',
  // Add more mappings as needed
};

/**
 * Normalize a raw event
 *
 * @param raw - Raw event from data source
 * @returns Normalized event
 */
export function normalizeEvent(raw: RawEvent): NormalizedEvent {
  return {
    id: raw.id,
    tier: raw.tier,
    title: normalizeTitle(raw.title),
    url: normalizeUrl(raw.url),
    publishedAt: raw.publishedAt,
    fetchedAt: raw.fetchedAt,
    tickerCodes: resolveTickerCodes(raw.tickerCodes, raw.title),
    eventType: classifyEventType(raw.title, raw.excerpt),
    sourceName: getSourceDisplayName(raw.source),
    excerpt: raw.excerpt,
  };
}

/**
 * Normalize title:
 * - Trim whitespace
 * - Remove excessive spaces
 * - Ensure grapheme safety (within 90-char limit for notifications)
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\r\n\t]/g, '') // Remove line breaks and tabs
    .substring(0, 200); // Limit length (will be further truncated for notifications)
}

/**
 * Normalize URL:
 * - Remove tracking parameters
 * - Standardize protocol (https)
 * - Remove fragment identifiers
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));

    // Remove fragment
    parsed.hash = '';

    // Standardize to https
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

/**
 * Resolve ticker codes:
 * - Validate format (4 digits)
 * - Map subsidiary/alias to parent company
 * - Remove duplicates
 *
 * @param codes - Initial ticker codes
 * @param context - Context text for additional extraction
 * @returns Resolved ticker codes
 */
function resolveTickerCodes(codes: string[], context: string): string[] {
  const resolved = new Set<string>();

  // Add explicitly provided codes
  for (const code of codes) {
    const normalized = normalizeTickerCode(code);
    if (normalized) {
      resolved.add(normalized);
    }
  }

  // Extract additional codes from context (company names → ticker)
  for (const [company, ticker] of Object.entries(COMPANY_TICKER_MAP)) {
    if (context.includes(company)) {
      resolved.add(ticker);
    }
  }

  return Array.from(resolved).sort();
}

/**
 * Normalize a single ticker code
 * - Ensure 4-digit format
 * - Validate range (1000-9999 for Japanese stocks)
 */
function normalizeTickerCode(code: string): string | null {
  const cleaned = code.trim().replace(/[^\d]/g, '').substring(0, 4);

  if (cleaned.length === 4) {
    const num = parseInt(cleaned, 10);
    if (num >= 1000 && num <= 9999) {
      return cleaned;
    }
  }

  return null;
}

/**
 * Classify event type using keyword dictionary
 * Per product spec: dictionary-based (Phase 1), AI-based (Phase 3)
 *
 * @param title - Event title
 * @param excerpt - Event excerpt/description
 * @returns Classified event type
 */
function classifyEventType(
  title: string,
  excerpt: string | undefined,
): EventType {
  const text = `${title} ${excerpt || ''}`.toLowerCase();

  for (const [eventType, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return eventType as EventType;
    }
  }

  return 'その他';
}

/**
 * Get display name for source identifier
 * Per product spec: show up to 2 sources in notifications
 */
function getSourceDisplayName(sourceId: string): string {
  const displayNames: Record<string, string> = {
    EDINET: 'EDINET',
    prtimes: 'PR TIMES',
    company_ir: '会社IR',
  };

  return displayNames[sourceId] || sourceId;
}

/**
 * Batch normalize multiple raw events
 */
export function normalizeEvents(rawEvents: RawEvent[]): NormalizedEvent[] {
  return rawEvents.map((raw) => normalizeEvent(raw));
}
