/**
 * App Initialization Hook
 *
 * Handles app startup tasks:
 * - Request notification permissions
 * - Load initial data (mock or real)
 * - Start periodic refresh
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../store';
import { setEvents, setLiveEvents, setLoading } from '../store/eventsSlice';
import { fetchAndProcessEvents } from '../store/thunks';

/**
 * Initialize app on mount
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useAppInit();
 *   // ... rest of component
 * }
 * ```
 */
export function useAppInit() {
  const dispatch = useDispatch<AppDispatch>();
  const watchlist = useSelector((state: RootState) => state.watchlist.tickers);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Initial data fetch
    if (watchlist.length > 0) {
      dispatch(setLoading(true));
      dispatch(fetchAndProcessEvents())
        .unwrap()
        .then((result) => {
          dispatch(setEvents(result.allEvents));
          dispatch(setLiveEvents(result.liveEvents));
        })
        .catch((error) => {
          console.error('Failed to fetch events:', error);
        });
    }
  }, [dispatch, watchlist.length]);

  // Fetch events whenever watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      dispatch(setLoading(true));
      dispatch(fetchAndProcessEvents())
        .unwrap()
        .then((result) => {
          dispatch(setEvents(result.allEvents));
          dispatch(setLiveEvents(result.liveEvents));
        })
        .catch((error) => {
          console.error('Failed to fetch events:', error);
        });
    }
  }, [dispatch, watchlist]);
}

/**
 * Auto-refresh hook
 *
 * Periodically fetches new events (e.g., every 60 seconds)
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useAutoRefresh(60000); // Refresh every 60 seconds
 * }
 * ```
 */
export function useAutoRefresh(intervalMs = 60000) {
  const dispatch = useDispatch<AppDispatch>();
  const watchlist = useSelector((state: RootState) => state.watchlist.tickers);

  useEffect(() => {
    if (watchlist.length === 0) return;

    const interval = setInterval(() => {
      dispatch(fetchAndProcessEvents());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [dispatch, intervalMs, watchlist.length]);
}
