/**
 * RSS Feed Service
 *
 * Fetches and parses RSS feeds from IR/PR sources
 * Per product spec: Semi-primary sources (tier B)
 * - Company IR official RSS
 * - PR distribution services (PR TIMES, etc.)
 */

import { XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';

import { RawEvent, RSSFeedItem } from '../types/events';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/**
 * RSS feed source configuration
 */
export interface RSSFeedSource {
  /** Unique identifier for this feed source */
  id: string;
  /** Display name */
  name: string;
  /** RSS feed URL */
  url: string;
  /** Source tier (usually 'B' for IR/PR) */
  tier: 'A' | 'B' | 'C';
  /** Optional: ticker codes associated with this feed (for company-specific IR) */
  tickerCodes?: string[];
}

/**
 * Fetch and parse RSS feed
 *
 * @param feedUrl - RSS feed URL
 * @returns Array of parsed RSS feed items
 */
export async function fetchRSSFeed(feedUrl: string): Promise<RSSFeedItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'BizStockAlert/0.1.0',
      },
    });

    if (!response.ok) {
      throw new Error(
        `RSS fetch error: ${response.status} ${response.statusText}`,
      );
    }

    const xmlText = await response.text();
    const parsed = xmlParser.parse(xmlText);

    // Handle both RSS 2.0 and Atom feed formats
    if (parsed.rss?.channel?.item) {
      return parseRSS20(parsed.rss.channel.item);
    } else if (parsed.feed?.entry) {
      return parseAtom(parsed.feed.entry);
    } else {
      throw new Error('Unsupported feed format');
    }
  } catch (error) {
    console.error(`Failed to fetch RSS feed ${feedUrl}:`, error);
    throw error;
  }
}

/**
 * Parse RSS 2.0 format
 */
function parseRSS20(items: unknown): RSSFeedItem[] {
  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.map((item: Record<string, unknown>) => ({
    title: (item.title as string) || '',
    link: (item.link as string) || '',
    pubDate: (item.pubDate as string) || new Date().toISOString(),
    description: (item.description as string) || '',
    categories: item.category
      ? Array.isArray(item.category)
        ? item.category
        : [item.category]
      : [],
  }));
}

/**
 * Parse Atom format
 */
function parseAtom(entries: unknown): RSSFeedItem[] {
  const entryArray = Array.isArray(entries) ? entries : [entries];

  return entryArray.map((entry: Record<string, unknown>) => {
    const link = entry.link as Record<string, unknown> | string | undefined;
    const linkHref =
      typeof link === 'object' && link
        ? (link['@_href'] as string)
        : link || '';

    return {
      title: (entry.title as string) || '',
      link: linkHref,
      pubDate:
        (entry.updated as string) ||
        (entry.published as string) ||
        new Date().toISOString(),
      description: (entry.summary as string) || (entry.content as string) || '',
      categories: entry.category
        ? Array.isArray(entry.category)
          ? entry.category.map(
              (c: Record<string, unknown> | string) =>
                (typeof c === 'object' ? (c['@_term'] as string) : c) || '',
            )
          : [
              (typeof entry.category === 'object'
                ? ((entry.category as Record<string, unknown>)[
                    '@_term'
                  ] as string)
                : entry.category) || '',
            ]
        : [],
    };
  });
}

/**
 * Fetch RSS feed and convert to RawEvents
 *
 * @param source - RSS feed source configuration
 * @returns Array of raw events
 */
export async function fetchRSSFeedEvents(
  source: RSSFeedSource,
): Promise<RawEvent[]> {
  try {
    const items = await fetchRSSFeed(source.url);

    return items.map((item) => convertRSSItemToRawEvent(item, source));
  } catch (error) {
    console.error(`Failed to fetch RSS feed events for ${source.name}:`, error);
    return [];
  }
}

/**
 * Convert RSS feed item to RawEvent
 */
function convertRSSItemToRawEvent(
  item: RSSFeedItem,
  source: RSSFeedSource,
): RawEvent {
  // Extract ticker codes from title or categories (heuristic)
  const extractedTickers = extractTickerCodes(
    item.title,
    item.description || '',
  );
  const tickerCodes =
    source.tickerCodes && source.tickerCodes.length > 0
      ? source.tickerCodes
      : extractedTickers;

  return {
    id: uuidv4(),
    source: source.id,
    tier: source.tier,
    title: item.title,
    url: item.link,
    publishedAt: new Date(item.pubDate).toISOString(),
    fetchedAt: new Date().toISOString(),
    tickerCodes,
    excerpt: item.description,
  };
}

/**
 * Extract ticker codes from text (simple heuristic)
 * Looks for 4-digit numbers that could be Japanese stock codes
 *
 * @param text - Text to search
 * @returns Array of potential ticker codes
 */
function extractTickerCodes(...texts: string[]): string[] {
  const combined = texts.join(' ');
  // Match 4-digit numbers (Japanese stock codes)
  const matches = combined.match(/\b\d{4}\b/g);
  if (!matches) return [];

  // Filter to valid ticker code range (typically 1000-9999)
  return [...new Set(matches)].filter(
    (code) => parseInt(code, 10) >= 1000 && parseInt(code, 10) <= 9999,
  );
}

/**
 * Fetch multiple RSS feeds concurrently
 *
 * @param sources - Array of RSS feed sources
 * @returns Array of all raw events from all sources
 */
export async function fetchMultipleRSSFeeds(
  sources: RSSFeedSource[],
): Promise<RawEvent[]> {
  const results = await Promise.allSettled(
    sources.map((source) => fetchRSSFeedEvents(source)),
  );

  const allEvents: RawEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value);
    } else {
      console.warn('RSS feed fetch failed:', result.reason);
    }
  }

  return allEvents;
}

/**
 * Pre-configured RSS feed sources for common PR/IR providers
 */
export const DEFAULT_RSS_SOURCES: RSSFeedSource[] = [
  // Add PR TIMES and other sources as needed
  // Example:
  // {
  //   id: 'prtimes',
  //   name: 'PR TIMES',
  //   url: 'https://prtimes.jp/main/feed/',
  //   tier: 'B',
  // },
];
