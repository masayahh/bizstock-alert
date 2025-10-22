/**
 * Event data types for BizStock Alert
 * Per product spec: IR/PR/EDINET event data structures
 */

/**
 * Source tier classification per product spec:
 * - A: Primary sources (EDINET, company IR official)
 * - B: Semi-primary sources (PR distribution like PR TIMES, company IR RSS)
 * - C: News headlines (not in MVP scope)
 */
export type SourceTier = 'A' | 'B' | 'C';

/**
 * Event type classification per product spec:
 * - 上方修正 (upward revision)
 * - 資本政策 (capital policy)
 * - 提携 (partnership)
 * - 事故 (incident)
 * - 規制 (regulation)
 * - その他 (other)
 */
export type EventType =
  | '上方修正'
  | '資本政策'
  | '提携'
  | '事故'
  | '規制'
  | '決算発表'
  | '業績予想'
  | '新製品'
  | '受注'
  | 'その他';

/**
 * Impact level per product spec:
 * - 強 (strong): A source OR multiple B sources
 * - 中 (medium): Single B source with meaningful event
 * - 弱 (weak): Low confidence or rumor-level
 */
export type ImpactLevel = '強' | '中' | '弱';

/**
 * Raw event data as fetched from source (EDINET/RSS)
 * Before normalization and clustering
 */
export interface RawEvent {
  /** Unique ID for this raw event (generated on fetch) */
  id: string;
  /** Source identifier (e.g., "EDINET", "PR_TIMES", "COMPANY_IR") */
  source: string;
  /** Source tier classification */
  tier: SourceTier;
  /** Original title/headline from source */
  title: string;
  /** Source URL (for attribution, per spec: no full-text redistribution) */
  url: string;
  /** ISO timestamp when event was published by source */
  publishedAt: string;
  /** ISO timestamp when we fetched this event */
  fetchedAt: string;
  /** Stock ticker codes mentioned (extracted or provided by source) */
  tickerCodes: string[];
  /** Optional: brief excerpt or description from source */
  excerpt?: string;
}

/**
 * Normalized event after processing:
 * - URL normalization
 * - Title cleanup
 * - Ticker code resolution
 * - Source tier assignment
 */
export interface NormalizedEvent {
  /** Unique ID (same as RawEvent.id) */
  id: string;
  /** Source tier */
  tier: SourceTier;
  /** Normalized title (cleaned up, grapheme-safe) */
  title: string;
  /** Normalized URL */
  url: string;
  /** Published timestamp (ISO) */
  publishedAt: string;
  /** Fetched timestamp (ISO) */
  fetchedAt: string;
  /** Resolved ticker codes (e.g., ["7203", "6758"]) */
  tickerCodes: string[];
  /** Event type classification (AI or dictionary-based) */
  eventType: EventType;
  /** Source display name for UI */
  sourceName: string;
  /** Optional: excerpt for context */
  excerpt?: string;
}

/**
 * Clustered event (aggregated from multiple raw events)
 * Per product spec: cluster by ticker × time window (±30min) × headline similarity
 */
export interface ClusteredEvent {
  /** Unique cluster ID */
  clusterId: string;
  /** All normalized events in this cluster */
  events: NormalizedEvent[];
  /** Representative ticker code (most relevant) */
  primaryTicker: string;
  /** All ticker codes mentioned across events */
  allTickers: string[];
  /** Cluster title (most representative or AI-generated summary) */
  title: string;
  /** Impact level (強 if A or multiple B, 中 if single meaningful B, 弱 otherwise) */
  impact: ImpactLevel;
  /** Event type (from most confident event in cluster) */
  eventType: EventType;
  /** Earliest published timestamp in cluster */
  publishedAt: string;
  /** Source names (up to 2 for display, per spec) */
  sources: string[];
  /** AI-generated summary (150-250 chars, facts only) */
  summary?: string;
  /** AI reasoning for impact level */
  reasoning?: string;
  /** Counter-reasoning (反証) */
  counterReasoning?: string;
}

/**
 * EDINET document metadata
 * For parsing EDINET API responses
 */
export interface EdinetDocument {
  /** Document ID from EDINET */
  docID: string;
  /** EDINETコード */
  edinetCode: string;
  /** 証券コード (may be null) */
  secCode: string | null;
  /** 提出者名 */
  filerName: string;
  /** 書類種別コード */
  docTypeCode: string;
  /** 書類種別 */
  docDescription: string;
  /** 提出日時 */
  submitDateTime: string;
}

/**
 * RSS feed item structure
 * Generic structure for parsing RSS feeds from IR/PR sources
 */
export interface RSSFeedItem {
  /** Title from RSS */
  title: string;
  /** Link/URL */
  link: string;
  /** Publication date */
  pubDate: string;
  /** Optional: description/content excerpt */
  description?: string;
  /** Optional: categories/tags */
  categories?: string[];
}

/**
 * User profile for personalization
 * Tracks user preferences and watchlist
 */
export interface UserProfile {
  /** User ID */
  userId: string;
  /** Watched ticker codes (portfolio) */
  watchlist: string[];
  /** Optional: portfolio positions for weighted scoring */
  positions?: Record<string, number>; // ticker -> share count
  /** Event type preferences (weight multipliers) */
  eventTypeWeights?: Partial<Record<EventType, number>>;
  /** Read event IDs (for digest filtering) */
  readEvents: Set<string>;
}

/**
 * Personalized event with relevance scoring
 * Extends ClusteredEvent with user-specific metadata
 */
export interface PersonalizedEvent extends ClusteredEvent {
  /** Relevance score for this user (0-100) */
  relevanceScore: number;
  /** User-specific impact level (may differ from base impact) */
  personalImpact: ImpactLevel;
  /** Reason for this score (for transparency) */
  scoreReason: string;
}

/**
 * Ranking configuration for event sorting
 */
export interface RankingConfig {
  /** Weight for relevance score (0-1) */
  relevanceWeight: number;
  /** Weight for recency (0-1) */
  recencyWeight: number;
  /** Weight for base impact level (0-1) */
  impactWeight: number;
  /** Boost multiplier for events with multiple sources */
  multiSourceBoost: number;
}
