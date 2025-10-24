/**
 * Notification Formatter Service
 *
 * Per product spec:
 * - 90-char limit for notifications
 * - Format: 🚨 7203 トヨタ｜生産計画を更新 影響:中〔出典:会社IR/PR〕
 * - Grapheme-safe truncation
 * - Maximum 2 sources shown
 */

import { NormalizedEvent, ImpactLevel } from '../types/events';

/**
 * Formatted notification ready for push
 */
export interface FormattedNotification {
  /** Formatted message (≤90 chars) */
  message: string;
  /** Ticker code */
  ticker: string;
  /** Impact level */
  impact: ImpactLevel;
  /** Event ID for idempotency */
  eventId: string;
  /** Sources (up to 2) */
  sources: string[];
}

/**
 * Format event as 90-char notification
 * Per product spec format:
 * 🚨 7203 トヨタ｜生産計画を更新 影響:中〔出典:会社IR/PR〕
 *
 * @param event - Normalized event
 * @param impact - Impact level (from clustering/AI, Phase 4)
 * @param companyName - Company name for display
 * @returns Formatted notification
 */
export function formatNotification(
  event: NormalizedEvent,
  impact: ImpactLevel,
  companyName?: string,
): FormattedNotification {
  const ticker = event.tickerCodes[0] || '????';
  const company = companyName || ticker;

  // Extract up to 2 sources per spec
  const sources = extractSources(event);
  const sourceStr = sources.slice(0, 2).join('/');

  // Build notification components
  const emoji = getImpactEmoji(impact);
  const prefix = `${emoji} ${ticker} ${company}｜`;
  const suffix = ` 影響:${impact}〔出典:${sourceStr}〕`;

  // Calculate available space for headline
  const maxLength = 90;
  const fixedLength = getGraphemeLength(prefix) + getGraphemeLength(suffix);
  const availableForHeadline = maxLength - fixedLength;

  // Truncate headline to fit
  const headline = truncateGraphemeSafe(event.title, availableForHeadline);

  const message = `${prefix}${headline}${suffix}`;

  return {
    message,
    ticker,
    impact,
    eventId: event.id,
    sources,
  };
}

/**
 * Extract source names from event
 * Per product spec: show up to 2 sources
 */
function extractSources(event: NormalizedEvent): string[] {
  // In production, this would be populated by clustering service
  // For now, return the sourceName from the event
  return [event.sourceName];
}

/**
 * Get emoji for impact level
 */
function getImpactEmoji(impact: ImpactLevel): string {
  switch (impact) {
    case '強':
      return '🚨';
    case '中':
      return '⚠️';
    case '弱':
      return 'ℹ️';
  }
}

/**
 * Get grapheme length (handles multi-byte characters correctly)
 * Uses Intl.Segmenter for proper grapheme cluster counting
 *
 * @param text - Text to measure
 * @returns Grapheme cluster count
 */
function getGraphemeLength(text: string): number {
  // Fallback for environments without Intl.Segmenter
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text)).length;
  }

  // Fallback: use Array.from which handles most Unicode correctly
  return Array.from(text).length;
}

/**
 * Truncate text to specified grapheme length
 * Ensures safe truncation at grapheme cluster boundaries
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum grapheme length
 * @returns Truncated text
 */
function truncateGraphemeSafe(text: string, maxLength: number): string {
  if (getGraphemeLength(text) <= maxLength) {
    return text;
  }

  // Use Intl.Segmenter for proper grapheme boundary detection
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text));

    let result = '';
    for (let i = 0; i < Math.min(maxLength, segments.length); i++) {
      result += segments[i].segment;
    }
    return result;
  }

  // Fallback: use Array.from
  const chars = Array.from(text);
  return chars.slice(0, maxLength).join('');
}

/**
 * Format digest summary notification
 * Used for scheduled digest notifications (12:15, 15:45)
 *
 * @param eventCount - Number of events in digest
 * @param digestType - Type of digest
 * @returns Formatted notification message
 */
export function formatDigestNotification(
  eventCount: number,
  digestType: 'midday' | 'closing',
): string {
  const typeLabel = digestType === 'midday' ? '昼' : '引け後';
  return `📋 ${typeLabel}のダイジェスト: ${eventCount}件の新着イベント`;
}

/**
 * Format morning digest notification
 * Special format for 08:30 morning digest
 *
 * @param eventCount - Number of events
 * @param hasMarketOutlook - Whether market outlook is included
 * @returns Formatted notification message
 */
export function formatMorningDigestNotification(
  eventCount: number,
  hasMarketOutlook: boolean,
): string {
  const outlookStr = hasMarketOutlook ? '市場見通しあり' : '';
  return `🌅 おはようございます: ${eventCount}件のイベント ${outlookStr}`.trim();
}

/**
 * Batch format multiple events
 * Useful for immediate notification of multiple related events
 *
 * @param events - Events to format
 * @param impact - Impact level
 * @returns Array of formatted notifications
 */
export function formatMultipleNotifications(
  events: NormalizedEvent[],
  impact: ImpactLevel,
): FormattedNotification[] {
  return events.map((event) => formatNotification(event, impact));
}
