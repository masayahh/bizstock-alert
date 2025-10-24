/**
 * Redux Selectors
 *
 * Memoized selectors for optimized state access.
 * Uses reselect for performance optimization.
 */

import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from './index';

/**
 * Base selectors (direct state access)
 */
export const selectWatchlistTickers = (state: RootState) =>
  state.watchlist.tickers;

export const selectAllEvents = (state: RootState) => state.events.events;

export const selectLiveEvents = (state: RootState) => state.events.liveEvents;

export const selectEventsLoading = (state: RootState) => state.events.loading;

export const selectEventsError = (state: RootState) => state.events.error;

export const selectReadEventIds = (state: RootState) =>
  state.events.readEventIds;

export const selectNotifications = (state: RootState) =>
  state.notifications.items;

export const selectSettings = (state: RootState) => state.settings;

/**
 * Memoized selectors
 */

/**
 * Get unread events only
 */
export const selectUnreadEvents = createSelector(
  [selectAllEvents, selectReadEventIds],
  (events, readEventIds) => {
    return events.filter(
      (event) =>
        !readEventIds.has(event.clusterId) &&
        !event.events.some((e) => readEventIds.has(e.id)),
    );
  },
);

/**
 * Get events by ticker
 */
export const selectEventsByTicker = createSelector(
  [selectAllEvents, (_state: RootState, ticker: string) => ticker],
  (events, ticker) => {
    return events.filter((event) => event.allTickers.includes(ticker));
  },
);

/**
 * Get high-impact events only (強)
 */
export const selectHighImpactEvents = createSelector(
  [selectAllEvents],
  (events) => {
    return events.filter((event) => event.personalImpact === '強');
  },
);

/**
 * Get event count by impact level
 */
export const selectEventCountByImpact = createSelector(
  [selectAllEvents],
  (events) => {
    return {
      強: events.filter((e) => e.personalImpact === '強').length,
      中: events.filter((e) => e.personalImpact === '中').length,
      弱: events.filter((e) => e.personalImpact === '弱').length,
    };
  },
);

/**
 * Get ticker status map for Live Tiles
 */
export const selectTickerStatusMap = createSelector(
  [selectWatchlistTickers, selectLiveEvents, selectEventsLoading],
  (tickers, liveEvents, loading) => {
    const statusMap: Record<
      string,
      { status: string; importance: '強' | '中' | '弱' | null }
    > = {};

    for (const ticker of tickers) {
      const event = liveEvents.find((e) => e.primaryTicker === ticker);
      if (event) {
        statusMap[ticker] = {
          status: event.title.slice(0, 30) + '...',
          importance: event.personalImpact,
        };
      } else {
        statusMap[ticker] = {
          status: loading ? '読み込み中...' : '新規開示なし',
          importance: null,
        };
      }
    }

    return statusMap;
  },
);

/**
 * Get unread notification count
 */
export const selectUnreadNotificationCount = createSelector(
  [selectNotifications],
  (notifications) => {
    return notifications.filter((n) => !n.read).length;
  },
);

/**
 * Check if user has any watchlist items
 */
export const selectHasWatchlist = createSelector(
  [selectWatchlistTickers],
  (tickers) => tickers.length > 0,
);

/**
 * Check if app is in initial loading state
 */
export const selectIsInitialLoading = createSelector(
  [selectHasWatchlist, selectEventsLoading, selectAllEvents],
  (hasWatchlist, loading, events) => {
    return hasWatchlist && loading && events.length === 0;
  },
);
