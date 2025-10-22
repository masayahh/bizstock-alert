/**
 * Redux Thunks
 *
 * Async actions that integrate service layer with Redux store.
 * Orchestrates the full data pipeline: ingestion → clustering → personalization → ranking
 */

import { createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from './index';
import { clusterEvents } from '../services/clusteringService';
import {
  filterUnreadEvents,
  personalizeEvents,
} from '../services/personalizationService';
import {
  getTopEvents,
  LIVE_FEED_RANKING,
  MORNING_DIGEST_RANKING,
  rankEvents,
} from '../services/rankingService';
import { ClusteredEvent, NormalizedEvent, UserProfile } from '../types/events';
import {
  generateMockDigestEvents,
  generateMockLiveTileEvents,
  isMockMode,
} from '../utils/mockData';

/**
 * Fetch and process events from data sources
 *
 * Full pipeline:
 * 1. Ingest data (EDINET + RSS) OR use mock data
 * 2. Normalize events
 * 3. Cluster by ticker × time × similarity
 * 4. Personalize for user
 * 5. Rank by relevance
 */
export const fetchAndProcessEvents = createAsyncThunk<
  {
    allEvents: ReturnType<typeof personalizeEvents>;
    liveEvents: ReturnType<typeof getTopEvents>;
  },
  void,
  { state: RootState }
>('events/fetchAndProcess', async (_, { getState }) => {
  const state = getState();
  const watchlistTickers = state.watchlist.tickers;

  // Create user profile from Redux state
  // Note: userProfile will be used when real data pipeline is enabled
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userProfile: UserProfile = {
    userId: 'default-user',
    watchlist: watchlistTickers,
    readEvents: state.events.readEventIds,
  };

  // Check if mock mode
  if (isMockMode()) {
    // Use mock data for testing without API keys
    const mockEvents = generateMockLiveTileEvents(watchlistTickers);
    return {
      allEvents: mockEvents,
      liveEvents: mockEvents.slice(0, 3),
    };
  }

  // REAL DATA PIPELINE (requires API keys)
  // Note: This will be enabled once user sets up API keys

  // Step 1: Data Ingestion (Phase 1)
  // const rawEvents = await ingestData({
  //   edinetEnabled: true,
  //   rssFeeds: DEFAULT_RSS_FEEDS,
  // });

  // Step 2: Normalization (Phase 1)
  // const normalizedEvents = rawEvents.map(normalizeEvent);

  // Step 3: Clustering (Phase 4)
  // const clusteredEvents = clusterEvents(normalizedEvents, {
  //   timeWindowMinutes: 30,
  //   similarityThreshold: 0.7,
  // });

  // Step 4: Personalization (Phase 5)
  // const personalizedEvents = personalizeEvents(clusteredEvents, userProfile);

  // Step 5: Ranking (Phase 5)
  // const rankedEvents = rankEvents(personalizedEvents, LIVE_FEED_RANKING);
  // const liveEvents = getTopEvents(rankedEvents, 5, LIVE_FEED_RANKING);

  // For now, return mock data with TODO comment
  console.warn(
    'API keys not configured. Using mock data. Set EXPO_PUBLIC_OPENAI_API_KEY to enable real data.',
  );

  const mockEvents = generateMockLiveTileEvents(watchlistTickers);
  return {
    allEvents: mockEvents,
    liveEvents: mockEvents.slice(0, 3),
  };
});

/**
 * Generate digest for scheduled notifications
 *
 * Used for morning (08:30), midday (12:15), and closing (15:45) digests
 */
export const generateDigest = createAsyncThunk<
  ReturnType<typeof filterUnreadEvents>,
  'morning' | 'midday' | 'closing',
  { state: RootState }
>('events/generateDigest', async (digestType, { getState }) => {
  const state = getState();
  const watchlistTickers = state.watchlist.tickers;

  // Create user profile
  const userProfile: UserProfile = {
    userId: 'default-user',
    watchlist: watchlistTickers,
    readEvents: state.events.readEventIds,
  };

  if (isMockMode()) {
    const mockEvents = generateMockDigestEvents(watchlistTickers);
    const unreadEvents = filterUnreadEvents(mockEvents, userProfile);

    // Rank by digest type
    const rankingConfig =
      digestType === 'morning' ? MORNING_DIGEST_RANKING : LIVE_FEED_RANKING;

    return rankEvents(unreadEvents, rankingConfig);
  }

  // REAL DIGEST GENERATION (requires API keys)
  // This would filter events by time window (e.g., since last digest)
  // and rank them appropriately for the digest type

  const mockEvents = generateMockDigestEvents(watchlistTickers);
  return filterUnreadEvents(mockEvents, userProfile);
});

/**
 * Refresh live tile events
 *
 * Called periodically to update the live feed
 */
export const refreshLiveEvents = createAsyncThunk<
  ReturnType<typeof getTopEvents>,
  void,
  { state: RootState }
>('events/refreshLive', async (_, { getState }) => {
  const state = getState();
  const allEvents = state.events.events;

  if (allEvents.length === 0) {
    // No events yet, trigger full fetch
    return [];
  }

  // Re-rank existing events with live feed config
  const rankedEvents = rankEvents(allEvents, LIVE_FEED_RANKING);
  return getTopEvents(rankedEvents, 5, LIVE_FEED_RANKING);
});

/**
 * Process new events from real-time data pipeline
 *
 * Used when new events arrive via ingestion loop
 */
export const processNewEvents = createAsyncThunk<
  ReturnType<typeof personalizeEvents>,
  NormalizedEvent[],
  { state: RootState }
>('events/processNew', async (normalizedEvents, { getState }) => {
  const state = getState();
  const watchlistTickers = state.watchlist.tickers;

  const userProfile: UserProfile = {
    userId: 'default-user',
    watchlist: watchlistTickers,
    readEvents: state.events.readEventIds,
  };

  // Cluster new events
  const clusteredEvents: ClusteredEvent[] = clusterEvents(normalizedEvents, {
    timeWindowMinutes: 30,
    similarityThreshold: 0.7,
  });

  // Personalize for user
  const personalizedEvents = personalizeEvents(clusteredEvents, userProfile);

  // Rank by recency (live feed config)
  return rankEvents(personalizedEvents, LIVE_FEED_RANKING);
});
