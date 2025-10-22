/**
 * Data Ingestion Service
 *
 * Orchestrates data fetching from multiple sources:
 * - EDINET API (tier A)
 * - RSS feeds (tier B)
 *
 * Per product spec:
 * - Fetch cycle: 30-60 seconds
 * - Parallel fetching from all sources
 * - Error handling with retry logic
 * - Normalization pipeline
 */

import {
  fetchLatestEdinetDocuments,
  fetchEdinetDocuments,
} from './edinetService';
import { normalizeEvents } from './normalizationService';
import {
  fetchMultipleRSSFeeds,
  RSSFeedSource,
  DEFAULT_RSS_SOURCES,
} from './rssService';
import { NormalizedEvent, RawEvent } from '../types/events';

/**
 * Ingestion result with metadata
 */
export interface IngestionResult {
  /** Successfully fetched and normalized events */
  events: NormalizedEvent[];
  /** Total raw events fetched (before normalization) */
  totalRaw: number;
  /** Number of events from each source tier */
  tierCounts: {
    A: number;
    B: number;
    C: number;
  };
  /** Errors encountered during fetch (non-fatal) */
  errors: string[];
  /** Ingestion timestamp */
  timestamp: string;
}

/**
 * Ingestion configuration
 */
export interface IngestionConfig {
  /** Whether to fetch EDINET data */
  enableEdinet: boolean;
  /** Whether to fetch RSS data */
  enableRSS: boolean;
  /** Custom RSS feed sources (defaults to DEFAULT_RSS_SOURCES) */
  rssSources?: RSSFeedSource[];
  /** EDINET date (YYYY-MM-DD), defaults to today */
  edinetDate?: string;
}

/**
 * Ingest data from all configured sources
 *
 * @param config - Ingestion configuration
 * @returns Ingestion result with normalized events
 */
export async function ingestData(
  config: IngestionConfig = {
    enableEdinet: true,
    enableRSS: true,
  },
): Promise<IngestionResult> {
  const startTime = Date.now();
  const rawEvents: RawEvent[] = [];
  const errors: string[] = [];

  // Fetch from all sources in parallel
  const fetchPromises: Promise<RawEvent[]>[] = [];

  if (config.enableEdinet) {
    fetchPromises.push(
      fetchEdinetData(config.edinetDate).catch((error) => {
        errors.push(`EDINET fetch error: ${error.message}`);
        return [];
      }),
    );
  }

  if (config.enableRSS) {
    fetchPromises.push(
      fetchRSSData(config.rssSources).catch((error) => {
        errors.push(`RSS fetch error: ${error.message}`);
        return [];
      }),
    );
  }

  // Wait for all fetches to complete
  const results = await Promise.all(fetchPromises);
  for (const result of results) {
    rawEvents.push(...result);
  }

  // Normalize all raw events
  const normalizedEvents = normalizeEvents(rawEvents);

  // Calculate tier counts
  const tierCounts = {
    A: normalizedEvents.filter((e) => e.tier === 'A').length,
    B: normalizedEvents.filter((e) => e.tier === 'B').length,
    C: normalizedEvents.filter((e) => e.tier === 'C').length,
  };

  const duration = Date.now() - startTime;
  console.log(
    `Data ingestion completed in ${duration}ms: ${normalizedEvents.length} events (A:${tierCounts.A}, B:${tierCounts.B}, C:${tierCounts.C})`,
  );

  return {
    events: normalizedEvents,
    totalRaw: rawEvents.length,
    tierCounts,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch EDINET data with error handling
 */
async function fetchEdinetData(date?: string): Promise<RawEvent[]> {
  if (date) {
    return await fetchEdinetDocuments(date);
  } else {
    return await fetchLatestEdinetDocuments();
  }
}

/**
 * Fetch RSS data with error handling
 */
async function fetchRSSData(sources?: RSSFeedSource[]): Promise<RawEvent[]> {
  const feedSources = sources || DEFAULT_RSS_SOURCES;
  return await fetchMultipleRSSFeeds(feedSources);
}

/**
 * Continuous ingestion loop (for background service)
 * Per product spec: 30-60 second cycle
 *
 * @param config - Ingestion configuration
 * @param intervalMs - Interval between ingestions (default: 60000ms = 1 min)
 * @param onData - Callback invoked with each ingestion result
 * @returns Stop function to halt the loop
 */
export function startIngestionLoop(
  config: IngestionConfig,
  intervalMs = 60000,
  onData: (result: IngestionResult) => void,
): () => void {
  let running = true;

  const loop = async () => {
    while (running) {
      try {
        const result = await ingestData(config);
        onData(result);
      } catch (error) {
        console.error('Ingestion loop error:', error);
      }

      // Wait for next cycle
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  };

  // Start the loop
  loop();

  // Return stop function
  return () => {
    running = false;
  };
}

/**
 * Ingest data for specific ticker codes only
 * Useful for user-specific watchlist filtering
 *
 * @param config - Ingestion configuration
 * @param tickerCodes - Ticker codes to filter for
 * @returns Filtered ingestion result
 */
export async function ingestDataForTickers(
  config: IngestionConfig,
  tickerCodes: string[],
): Promise<IngestionResult> {
  const result = await ingestData(config);

  // Filter events to only those mentioning watched tickers
  const filteredEvents = result.events.filter((event) =>
    event.tickerCodes.some((code) => tickerCodes.includes(code)),
  );

  return {
    ...result,
    events: filteredEvents,
  };
}
