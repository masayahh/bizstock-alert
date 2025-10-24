/**
 * Personalization Service
 *
 * Per product spec:
 * - User-specific impact estimation
 * - Relevance scoring based on watchlist and positions
 * - Event type preference weighting
 * - Transparent scoring reasons
 */

import {
  ClusteredEvent,
  EventType,
  ImpactLevel,
  PersonalizedEvent,
  UserProfile,
} from '../types/events';

/**
 * Default event type weights for scoring
 * Higher values = more important to most users
 */
const DEFAULT_EVENT_TYPE_WEIGHTS: Record<EventType, number> = {
  上方修正: 1.5, // High importance
  資本政策: 1.4,
  決算発表: 1.3,
  業績予想: 1.2,
  提携: 1.1,
  受注: 1.0,
  新製品: 0.9,
  事故: 1.4, // High importance (negative)
  規制: 1.2,
  その他: 0.5,
};

/**
 * Impact level to numeric score mapping
 */
const IMPACT_SCORE: Record<ImpactLevel, number> = {
  強: 100,
  中: 60,
  弱: 30,
};

/**
 * Calculate relevance score for an event to a specific user
 *
 * Scoring factors:
 * 1. Ticker match (base score)
 * 2. Portfolio position size (if available)
 * 3. Event type preference
 * 4. Base impact level
 * 5. Multi-source boost
 *
 * @param event - Clustered event
 * @param profile - User profile
 * @returns Score 0-100 with explanation
 */
export function calculateRelevanceScore(
  event: ClusteredEvent,
  profile: UserProfile,
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Ticker match scoring
  const matchedTickers = event.allTickers.filter((ticker) =>
    profile.watchlist.includes(ticker),
  );

  if (matchedTickers.length === 0) {
    return { score: 0, reason: 'ウォッチリストに該当銘柄なし' };
  }

  // Base score for ticker match
  score += 30;
  reasons.push(`ウォッチリスト銘柄: ${matchedTickers.join(', ')}`);

  // 2. Portfolio position weighting
  if (profile.positions) {
    const positions = profile.positions;
    const totalShares = Object.values(positions).reduce(
      (sum, shares) => sum + shares,
      0,
    );
    const matchedShares = matchedTickers.reduce(
      (sum, ticker) => sum + (positions[ticker] || 0),
      0,
    );

    if (totalShares > 0) {
      const positionWeight = matchedShares / totalShares;
      const positionBoost = positionWeight * 20; // Up to +20 points
      score += positionBoost;
      if (positionBoost > 5) {
        reasons.push(
          `保有比率: ${(positionWeight * 100).toFixed(0)}% (+${positionBoost.toFixed(0)}pt)`,
        );
      }
    }
  }

  // 3. Event type weighting
  const eventTypeWeights = profile.eventTypeWeights || {};
  const typeWeight =
    eventTypeWeights[event.eventType] ||
    DEFAULT_EVENT_TYPE_WEIGHTS[event.eventType];
  const typeBoost = (typeWeight - 1.0) * 15; // ±15 points
  score += typeBoost;
  if (Math.abs(typeBoost) > 2) {
    reasons.push(
      `イベント種別: ${event.eventType} (${typeBoost > 0 ? '+' : ''}${typeBoost.toFixed(0)}pt)`,
    );
  }

  // 4. Base impact level
  const impactBoost = IMPACT_SCORE[event.impact] * 0.2; // Up to +20 points
  score += impactBoost;
  reasons.push(`影響度: ${event.impact} (+${impactBoost.toFixed(0)}pt)`);

  // 5. Multi-source boost (信頼性)
  if (event.sources.length >= 2) {
    const multiSourceBoost = 10;
    score += multiSourceBoost;
    reasons.push(
      `複数ソース: ${event.sources.length}件 (+${multiSourceBoost}pt)`,
    );
  }

  // Normalize score to 0-100 range
  score = Math.min(100, Math.max(0, score));

  return {
    score: Math.round(score),
    reason: reasons.join('; '),
  };
}

/**
 * Determine personalized impact level
 *
 * May upgrade base impact if:
 * - Event is highly relevant to user's portfolio
 * - Event type is critical for user
 *
 * Never downgrades tier A events (強)
 *
 * @param event - Clustered event
 * @param profile - User profile
 * @param relevanceScore - Pre-calculated relevance score
 * @returns Personalized impact level
 */
export function determinePersonalImpact(
  event: ClusteredEvent,
  profile: UserProfile,
  relevanceScore: number,
): ImpactLevel {
  const baseImpact = event.impact;

  // Never downgrade tier A events
  if (baseImpact === '強') {
    return '強';
  }

  // Upgrade 弱→中 if relevance is high
  if (baseImpact === '弱' && relevanceScore >= 70) {
    return '中';
  }

  // Upgrade 中→強 if relevance is very high
  if (baseImpact === '中' && relevanceScore >= 85) {
    return '強';
  }

  // Check if event type is critical for this user
  const eventTypeWeights = profile.eventTypeWeights || {};
  const typeWeight =
    eventTypeWeights[event.eventType] ||
    DEFAULT_EVENT_TYPE_WEIGHTS[event.eventType];

  if (typeWeight >= 1.4 && baseImpact === '中') {
    return '強'; // Upgrade critical event types
  }

  return baseImpact;
}

/**
 * Personalize a clustered event for a specific user
 *
 * @param event - Clustered event
 * @param profile - User profile
 * @returns Personalized event with scoring
 */
export function personalizeEvent(
  event: ClusteredEvent,
  profile: UserProfile,
): PersonalizedEvent {
  const { score, reason } = calculateRelevanceScore(event, profile);
  const personalImpact = determinePersonalImpact(event, profile, score);

  return {
    ...event,
    relevanceScore: score,
    personalImpact,
    scoreReason: reason,
  };
}

/**
 * Personalize multiple events for a user
 *
 * @param events - Clustered events
 * @param profile - User profile
 * @returns Personalized events (only those relevant to user)
 */
export function personalizeEvents(
  events: ClusteredEvent[],
  profile: UserProfile,
): PersonalizedEvent[] {
  return events
    .map((event) => personalizeEvent(event, profile))
    .filter((event) => event.relevanceScore > 0); // Only return relevant events
}

/**
 * Filter out already-read events
 * Per product spec: Digests should exclude already-read events
 *
 * @param events - Personalized events
 * @param profile - User profile with read event tracking
 * @returns Unread events only
 */
export function filterUnreadEvents(
  events: PersonalizedEvent[],
  profile: UserProfile,
): PersonalizedEvent[] {
  return events.filter(
    (event) =>
      !profile.readEvents.has(event.clusterId) &&
      !event.events.some((e) => profile.readEvents.has(e.id)),
  );
}

/**
 * Mark events as read by user
 *
 * @param profile - User profile to update
 * @param eventIds - Event or cluster IDs to mark as read
 */
export function markEventsAsRead(
  profile: UserProfile,
  eventIds: string[],
): void {
  for (const id of eventIds) {
    profile.readEvents.add(id);
  }
}

/**
 * Create default user profile
 *
 * @param userId - User identifier
 * @param watchlist - Initial watchlist ticker codes
 * @returns New user profile
 */
export function createUserProfile(
  userId: string,
  watchlist: string[],
): UserProfile {
  return {
    userId,
    watchlist,
    readEvents: new Set(),
  };
}
