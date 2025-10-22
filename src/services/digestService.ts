/**
 * Digest Generation Service
 *
 * Per product spec:
 * - 08:30 Morning digest: market outlook + watchlist events (last 24h)
 * - 12:15 / 15:45 Digest: aggregate 中/弱 events, exclude already-read
 * - "No activity" visibility: optional single notification
 */

import { NormalizedEvent } from '../types/events';

/**
 * Digest types per product spec schedule
 */
export type DigestType = 'morning' | 'midday' | 'closing';

/**
 * Digest content structure
 */
export interface DigestContent {
  /** Digest type */
  type: DigestType;
  /** Title for the digest */
  title: string;
  /** Events grouped by ticker */
  eventsByTicker: Map<string, NormalizedEvent[]>;
  /** Total event count */
  totalEvents: number;
  /** Market outlook summary (morning only) */
  marketOutlook?: string;
  /** Important economic events (morning only) */
  economicEvents?: string[];
  /** Generation timestamp */
  generatedAt: string;
}

/**
 * Generate morning digest (08:30)
 * Per product spec:
 * - Market outlook (editorial priority pill)
 * - Watchlist events summary (last 24h IR/PR/EDINET)
 * - Important economic events with sector impact
 *
 * @param events - Events from last 24 hours
 * @param watchlistTickers - User's watchlist ticker codes
 * @returns Morning digest content
 */
export function generateMorningDigest(
  events: NormalizedEvent[],
  watchlistTickers: string[],
): DigestContent {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filter events from last 24h that mention watchlist tickers
  const relevantEvents = events.filter(
    (event) =>
      new Date(event.publishedAt) >= yesterday &&
      event.tickerCodes.some((code) => watchlistTickers.includes(code)),
  );

  // Group events by primary ticker
  const eventsByTicker = groupEventsByTicker(relevantEvents, watchlistTickers);

  return {
    type: 'morning',
    title: '今日の市場見通しと保有銘柄の動き',
    eventsByTicker,
    totalEvents: relevantEvents.length,
    marketOutlook: generateMarketOutlook(),
    economicEvents: generateEconomicEvents(),
    generatedAt: now.toISOString(),
  };
}

/**
 * Generate midday digest (12:15)
 * Per product spec:
 * - Aggregate 中/弱 events
 * - Exclude already-read events
 * - Maintain quietness (no notifications if no new events)
 *
 * @param events - Events since last digest
 * @param watchlistTickers - User's watchlist ticker codes
 * @param readEventIds - IDs of events user has already read
 * @returns Midday digest content
 */
export function generateMiddayDigest(
  events: NormalizedEvent[],
  watchlistTickers: string[],
  readEventIds: Set<string> = new Set(),
): DigestContent {
  const relevantEvents = events.filter(
    (event) =>
      !readEventIds.has(event.id) &&
      event.tickerCodes.some((code) => watchlistTickers.includes(code)),
  );

  const eventsByTicker = groupEventsByTicker(relevantEvents, watchlistTickers);

  return {
    type: 'midday',
    title: '昼のダイジェスト',
    eventsByTicker,
    totalEvents: relevantEvents.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate closing digest (15:45)
 * Similar to midday but at market close
 *
 * @param events - Events since last digest
 * @param watchlistTickers - User's watchlist ticker codes
 * @param readEventIds - IDs of events user has already read
 * @returns Closing digest content
 */
export function generateClosingDigest(
  events: NormalizedEvent[],
  watchlistTickers: string[],
  readEventIds: Set<string> = new Set(),
): DigestContent {
  const relevantEvents = events.filter(
    (event) =>
      !readEventIds.has(event.id) &&
      event.tickerCodes.some((code) => watchlistTickers.includes(code)),
  );

  const eventsByTicker = groupEventsByTicker(relevantEvents, watchlistTickers);

  return {
    type: 'closing',
    title: '引け後のダイジェスト',
    eventsByTicker,
    totalEvents: relevantEvents.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Group events by ticker code
 * Prioritize tickers in user's watchlist order
 */
function groupEventsByTicker(
  events: NormalizedEvent[],
  watchlistTickers: string[],
): Map<string, NormalizedEvent[]> {
  const grouped = new Map<string, NormalizedEvent[]>();

  // Initialize with watchlist tickers to preserve order
  for (const ticker of watchlistTickers) {
    grouped.set(ticker, []);
  }

  // Group events
  for (const event of events) {
    for (const ticker of event.tickerCodes) {
      if (watchlistTickers.includes(ticker)) {
        const existing = grouped.get(ticker) || [];
        existing.push(event);
        grouped.set(ticker, existing);
      }
    }
  }

  // Remove tickers with no events
  for (const [ticker, events] of grouped.entries()) {
    if (events.length === 0) {
      grouped.delete(ticker);
    }
  }

  return grouped;
}

/**
 * Generate market outlook summary
 * Per product spec: editorial priority pill + 150-200 chars
 *
 * TODO: In Phase 3, integrate with AI service for real outlook
 * For now, return placeholder
 */
function generateMarketOutlook(): string {
  // Placeholder: In production, this would call AI service
  // to generate outlook based on overnight events, futures, etc.
  return '本日の市場見通しは中立。海外市況は小幅な動きが続いています。';
}

/**
 * Generate important economic events for today
 * Per product spec: Time + event + sector impact
 *
 * TODO: Integrate with economic calendar API
 * For now, return placeholder
 */
function generateEconomicEvents(): string[] {
  // Placeholder: In production, fetch from economic calendar
  return [
    '10:30 消費者物価指数（前年比）→ 小売/食品セクターに影響',
    '14:00 日銀政策決定会合の議事要旨公表 → 銀行/不動産セクターに影響',
  ];
}

/**
 * Generate "no activity" notification
 * Per product spec: Optional single notification when no new events
 *
 * @param asOf - Timestamp to report "as of"
 * @returns Notification message
 */
export function generateNoActivityNotification(
  asOf: Date = new Date(),
): string {
  const timeStr = asOf.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });

  return `本日は保有銘柄の新規開示なし（${timeStr}時点）`;
}
