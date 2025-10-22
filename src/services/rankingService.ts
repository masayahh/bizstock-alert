/**
 * Ranking Service
 *
 * Per product spec:
 * - Sort events by relevance and recency
 * - Configurable ranking weights
 * - Multi-factor scoring for optimal ordering
 */

import { ImpactLevel, PersonalizedEvent, RankingConfig } from '../types/events';

/**
 * Default ranking configuration
 * Balances relevance, recency, and impact
 */
export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  relevanceWeight: 0.5, // 50% weight on user relevance
  recencyWeight: 0.3, // 30% weight on how recent
  impactWeight: 0.2, // 20% weight on base impact
  multiSourceBoost: 1.15, // 15% boost for multiple sources
};

/**
 * Impact level to ranking score
 */
const IMPACT_RANKING_SCORE: Record<ImpactLevel, number> = {
  強: 100,
  中: 60,
  弱: 30,
};

/**
 * Calculate recency score (0-100)
 * Recent events score higher
 *
 * @param publishedAt - Event publication timestamp
 * @param referenceTime - Reference time for recency (defaults to now)
 * @returns Recency score 0-100
 */
export function calculateRecencyScore(
  publishedAt: string,
  referenceTime: Date = new Date(),
): number {
  const eventTime = new Date(publishedAt);
  const ageMs = referenceTime.getTime() - eventTime.getTime();

  // Score decay: 100 at 0min, 80 at 1h, 60 at 6h, 40 at 24h, 20 at 48h, 0 at 7d
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 0) return 100; // Future events (shouldn't happen)
  if (ageHours < 1) return 100; // Last hour: 100
  if (ageHours < 6) return 90; // Last 6 hours: 90
  if (ageHours < 24) return 70; // Last 24 hours: 70
  if (ageHours < 48) return 40; // Last 48 hours: 40
  if (ageHours < 168) return 20; // Last week: 20

  return 0; // Older than a week: 0
}

/**
 * Calculate composite ranking score
 *
 * @param event - Personalized event
 * @param config - Ranking configuration
 * @param referenceTime - Reference time for recency
 * @returns Composite score for ranking
 */
export function calculateRankingScore(
  event: PersonalizedEvent,
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  referenceTime: Date = new Date(),
): number {
  // Component scores (0-100 each)
  const relevanceScore = event.relevanceScore;
  const recencyScore = calculateRecencyScore(event.publishedAt, referenceTime);
  const impactScore = IMPACT_RANKING_SCORE[event.personalImpact];

  // Weighted composite score
  let compositeScore =
    relevanceScore * config.relevanceWeight +
    recencyScore * config.recencyWeight +
    impactScore * config.impactWeight;

  // Apply multi-source boost
  if (event.sources.length >= 2) {
    compositeScore *= config.multiSourceBoost;
  }

  // Normalize to 0-100
  return Math.min(100, Math.max(0, compositeScore));
}

/**
 * Rank events by composite score
 *
 * @param events - Personalized events to rank
 * @param config - Ranking configuration
 * @param referenceTime - Reference time for recency
 * @returns Events sorted by ranking score (highest first)
 */
export function rankEvents(
  events: PersonalizedEvent[],
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  referenceTime: Date = new Date(),
): PersonalizedEvent[] {
  // Calculate ranking scores
  const scoredEvents = events.map((event) => ({
    event,
    rankingScore: calculateRankingScore(event, config, referenceTime),
  }));

  // Sort by score descending
  scoredEvents.sort((a, b) => b.rankingScore - a.rankingScore);

  return scoredEvents.map((item) => item.event);
}

/**
 * Rank events with tier priority
 * Ensures tier A (強) events always appear first
 *
 * @param events - Personalized events to rank
 * @param config - Ranking configuration
 * @param referenceTime - Reference time for recency
 * @returns Events sorted with tier A priority
 */
export function rankEventsWithTierPriority(
  events: PersonalizedEvent[],
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  referenceTime: Date = new Date(),
): PersonalizedEvent[] {
  // Separate by tier
  const tierA = events.filter((e) => e.impact === '強');
  const tierBC = events.filter((e) => e.impact !== '強');

  // Rank each tier separately
  const rankedA = rankEvents(tierA, config, referenceTime);
  const rankedBC = rankEvents(tierBC, config, referenceTime);

  // Combine: A events first, then B/C
  return [...rankedA, ...rankedBC];
}

/**
 * Group events by ticker and rank within groups
 * Useful for digest display
 *
 * @param events - Personalized events to group and rank
 * @param config - Ranking configuration
 * @param referenceTime - Reference time for recency
 * @returns Map of ticker → ranked events
 */
export function groupAndRankByTicker(
  events: PersonalizedEvent[],
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  referenceTime: Date = new Date(),
): Map<string, PersonalizedEvent[]> {
  const grouped = new Map<string, PersonalizedEvent[]>();

  // Group by primary ticker
  for (const event of events) {
    const ticker = event.primaryTicker;
    const existing = grouped.get(ticker) || [];
    existing.push(event);
    grouped.set(ticker, existing);
  }

  // Rank within each ticker group
  for (const [ticker, tickerEvents] of grouped.entries()) {
    grouped.set(ticker, rankEvents(tickerEvents, config, referenceTime));
  }

  return grouped;
}

/**
 * Get top N events by ranking
 *
 * @param events - Personalized events
 * @param limit - Maximum number of events to return
 * @param config - Ranking configuration
 * @param referenceTime - Reference time for recency
 * @returns Top N ranked events
 */
export function getTopEvents(
  events: PersonalizedEvent[],
  limit: number,
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  referenceTime: Date = new Date(),
): PersonalizedEvent[] {
  const ranked = rankEvents(events, config, referenceTime);
  return ranked.slice(0, limit);
}

/**
 * Create custom ranking config
 * Useful for different contexts (e.g., morning digest vs live feed)
 *
 * @param overrides - Partial config to override defaults
 * @returns Complete ranking config
 */
export function createRankingConfig(
  overrides: Partial<RankingConfig>,
): RankingConfig {
  return {
    ...DEFAULT_RANKING_CONFIG,
    ...overrides,
  };
}

/**
 * Preset: Morning digest ranking
 * Emphasizes recency less, relevance more
 */
export const MORNING_DIGEST_RANKING = createRankingConfig({
  relevanceWeight: 0.6,
  recencyWeight: 0.2,
  impactWeight: 0.2,
});

/**
 * Preset: Live feed ranking
 * Emphasizes recency heavily
 */
export const LIVE_FEED_RANKING = createRankingConfig({
  relevanceWeight: 0.3,
  recencyWeight: 0.5,
  impactWeight: 0.2,
});

/**
 * Preset: Impact-first ranking
 * For critical alerts only
 */
export const IMPACT_FIRST_RANKING = createRankingConfig({
  relevanceWeight: 0.3,
  recencyWeight: 0.2,
  impactWeight: 0.5,
  multiSourceBoost: 1.3, // Higher boost for critical alerts
});
