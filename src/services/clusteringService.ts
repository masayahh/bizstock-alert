/**
 * Event Clustering Service
 *
 * Per product spec:
 * - Cluster by: ticker × time window (±30min) × headline similarity
 * - Confidence evaluation: A (primary), B (semi-primary), C (news)
 * - Delivery condition: A exists OR B×2+
 * - Cooldown: same theme within 30min → merge to 1 cluster
 */

import { NormalizedEvent, ClusteredEvent, ImpactLevel } from '../types/events';

/**
 * Clustering configuration
 */
export interface ClusteringConfig {
  /** Time window for clustering (minutes, default: 30) */
  timeWindowMinutes: number;
  /** Similarity threshold for headline matching (0-1, default: 0.7) */
  similarityThreshold: number;
  /** Cooldown period for same theme (minutes, default: 30) */
  cooldownMinutes: number;
}

/**
 * Default clustering configuration
 * Per product spec: ±30min window
 */
const DEFAULT_CONFIG: ClusteringConfig = {
  timeWindowMinutes: 30,
  similarityThreshold: 0.7,
  cooldownMinutes: 30,
};

/**
 * Cluster events by ticker, time, and headline similarity
 * Per product spec: aggregate duplicate events from multiple sources
 *
 * @param events - Normalized events to cluster
 * @param config - Clustering configuration
 * @returns Clustered events
 */
export function clusterEvents(
  events: NormalizedEvent[],
  config: ClusteringConfig = DEFAULT_CONFIG,
): ClusteredEvent[] {
  if (events.length === 0) return [];

  // Sort events by published time (newest first)
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const clusters: ClusteredEvent[] = [];
  const processed = new Set<string>();

  for (const event of sortedEvents) {
    if (processed.has(event.id)) continue;

    // Find similar events within time window
    const similarEvents = findSimilarEvents(
      event,
      sortedEvents,
      config,
      processed,
    );

    // Create cluster
    const cluster = createCluster([event, ...similarEvents]);

    clusters.push(cluster);

    // Mark all events in cluster as processed
    processed.add(event.id);
    similarEvents.forEach((e) => processed.add(e.id));
  }

  return clusters;
}

/**
 * Find similar events within time window
 */
function findSimilarEvents(
  targetEvent: NormalizedEvent,
  allEvents: NormalizedEvent[],
  config: ClusteringConfig,
  processed: Set<string>,
): NormalizedEvent[] {
  const similar: NormalizedEvent[] = [];
  const targetTime = new Date(targetEvent.publishedAt).getTime();
  const windowMs = config.timeWindowMinutes * 60 * 1000;

  for (const event of allEvents) {
    // Skip if already processed or same event
    if (processed.has(event.id) || event.id === targetEvent.id) continue;

    // Check time window (±30min)
    const eventTime = new Date(event.publishedAt).getTime();
    const timeDiff = Math.abs(targetTime - eventTime);
    if (timeDiff > windowMs) continue;

    // Check ticker overlap
    const hasCommonTicker = targetEvent.tickerCodes.some((code) =>
      event.tickerCodes.includes(code),
    );
    if (!hasCommonTicker) continue;

    // Check headline similarity
    const similarity = calculateSimilarity(targetEvent.title, event.title);
    if (similarity >= config.similarityThreshold) {
      similar.push(event);
    }
  }

  return similar;
}

/**
 * Calculate text similarity using simple character-based approach
 * For production, consider using more sophisticated NLP (e.g., embeddings)
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  // Use Jaccard similarity on character bigrams
  const bigrams1 = getBigrams(normalized1);
  const bigrams2 = getBigrams(normalized2);

  const intersection = new Set([...bigrams1].filter((x) => bigrams2.has(x)));
  const union = new Set([...bigrams1, ...bigrams2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Normalize text for similarity calculation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[、。！？｜]/g, '');
}

/**
 * Get character bigrams from text
 */
function getBigrams(text: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < text.length - 1; i++) {
    bigrams.add(text.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Create cluster from events
 */
function createCluster(events: NormalizedEvent[]): ClusteredEvent {
  // Sort by tier (A > B > C) then by time (newest first)
  const sortedEvents = events.sort((a, b) => {
    const tierOrder = { A: 0, B: 1, C: 2 };
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  const primaryEvent = sortedEvents[0];

  // Aggregate all ticker codes
  const allTickers = new Set<string>();
  events.forEach((e) => e.tickerCodes.forEach((code) => allTickers.add(code)));

  // Aggregate source names (up to 2 per spec)
  const sourceNames = new Set<string>();
  events.forEach((e) => sourceNames.add(e.sourceName));

  // Determine impact level based on sources
  const impact = determineImpact(events);

  // Generate cluster ID
  const clusterId = generateClusterId(events);

  return {
    clusterId,
    events: sortedEvents,
    primaryTicker: primaryEvent.tickerCodes[0] || '',
    allTickers: Array.from(allTickers),
    title: primaryEvent.title,
    impact,
    eventType: primaryEvent.eventType,
    publishedAt: primaryEvent.publishedAt,
    sources: Array.from(sourceNames).slice(0, 2),
  };
}

/**
 * Determine impact level based on source tiers
 * Per product spec: A exists OR B×2+ → 強
 */
function determineImpact(events: NormalizedEvent[]): ImpactLevel {
  const tierCounts = {
    A: events.filter((e) => e.tier === 'A').length,
    B: events.filter((e) => e.tier === 'B').length,
    C: events.filter((e) => e.tier === 'C').length,
  };

  // Per product spec: A exists OR B×2+ → 強
  if (tierCounts.A > 0 || tierCounts.B >= 2) {
    return '強';
  }

  // Single B source with meaningful event → 中
  if (tierCounts.B === 1) {
    return '中';
  }

  // Otherwise → 弱
  return '弱';
}

/**
 * Generate cluster ID for idempotency
 * Per product spec: idempotencyKey prevents duplicate notifications
 *
 * Format: ticker_timestamp_hash
 */
function generateClusterId(events: NormalizedEvent[]): string {
  const primaryEvent = events[0];
  const timestamp = new Date(primaryEvent.publishedAt).getTime();

  // Simple hash of event IDs
  const eventIds = events
    .map((e) => e.id)
    .sort()
    .join('|');
  const hash = simpleHash(eventIds);

  const ticker = primaryEvent.tickerCodes[0] || 'unknown';

  return `${ticker}_${timestamp}_${hash}`;
}

/**
 * Simple hash function for cluster ID
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate idempotency key for notification
 * Per product spec: format clusterId:impact:version
 */
export function generateIdempotencyKey(
  cluster: ClusteredEvent,
  version = 1,
): string {
  return `${cluster.clusterId}:${cluster.impact}:${version}`;
}

/**
 * Check if cluster meets delivery conditions
 * Per product spec: A exists OR B×2+
 */
export function shouldDeliver(cluster: ClusteredEvent): boolean {
  const tierCounts = {
    A: cluster.events.filter((e) => e.tier === 'A').length,
    B: cluster.events.filter((e) => e.tier === 'B').length,
  };

  return tierCounts.A > 0 || tierCounts.B >= 2;
}

/**
 * Filter clusters by delivery conditions
 * Only return clusters that should be delivered
 */
export function filterDeliverableClusters(
  clusters: ClusteredEvent[],
): ClusteredEvent[] {
  return clusters.filter(shouldDeliver);
}

/**
 * Apply cooldown: merge clusters with same theme within cooldown period
 * Per product spec: same theme within 30min → 1 cluster
 */
export function applyCooldown(
  clusters: ClusteredEvent[],
  cooldownMinutes = 30,
): ClusteredEvent[] {
  if (clusters.length === 0) return [];

  const result: ClusteredEvent[] = [];
  const processed = new Set<string>();
  const cooldownMs = cooldownMinutes * 60 * 1000;

  // Sort by time (newest first)
  const sorted = [...clusters].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  for (const cluster of sorted) {
    if (processed.has(cluster.clusterId)) continue;

    // Find clusters within cooldown period with same ticker and event type
    const mergeables = sorted.filter((c) => {
      if (processed.has(c.clusterId) || c.clusterId === cluster.clusterId)
        return false;

      const timeDiff = Math.abs(
        new Date(cluster.publishedAt).getTime() -
          new Date(c.publishedAt).getTime(),
      );

      return (
        timeDiff <= cooldownMs &&
        c.primaryTicker === cluster.primaryTicker &&
        c.eventType === cluster.eventType
      );
    });

    if (mergeables.length > 0) {
      // Merge all events into one cluster
      const allEvents = [
        ...cluster.events,
        ...mergeables.flatMap((m) => m.events),
      ];
      const merged = createCluster(allEvents);
      result.push(merged);

      // Mark all as processed
      processed.add(cluster.clusterId);
      mergeables.forEach((m) => processed.add(m.clusterId));
    } else {
      result.push(cluster);
      processed.add(cluster.clusterId);
    }
  }

  return result;
}
