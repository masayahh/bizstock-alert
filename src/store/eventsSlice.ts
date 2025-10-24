/**
 * Events Slice
 *
 * Manages personalized and clustered events from the data pipeline.
 * Integrates with Phase 1-5 services (ingestion, clustering, personalization).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PersonalizedEvent } from '../types/events';

/**
 * State for managing events from the data pipeline
 */
export interface EventsState {
  /** All personalized events for the current user, sorted by ranking */
  events: PersonalizedEvent[];
  /** Events currently displayed in live tiles (top 3-5) */
  liveEvents: PersonalizedEvent[];
  /** Events for current digest (filtered by time window) */
  digestEvents: PersonalizedEvent[];
  /** Loading state for data ingestion */
  loading: boolean;
  /** Error message if ingestion fails */
  error: string | null;
  /** Last update timestamp (ISO) */
  lastUpdated: string | null;
  /** Set of event IDs that have been read by user */
  readEventIds: Set<string>;
}

const initialState: EventsState = {
  events: [],
  liveEvents: [],
  digestEvents: [],
  loading: false,
  error: null,
  lastUpdated: null,
  readEventIds: new Set(),
};

// Note: extraReducers will be added after thunks are defined
// Import will cause circular dependency, so we'll add reducers in a separate file
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    /**
     * Set all personalized events (called after ingestion + personalization)
     */
    setEvents: (state, action: PayloadAction<PersonalizedEvent[]>) => {
      state.events = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },

    /**
     * Update live tile events (top N ranked events)
     */
    setLiveEvents: (state, action: PayloadAction<PersonalizedEvent[]>) => {
      state.liveEvents = action.payload;
    },

    /**
     * Update digest events (for scheduled digests)
     */
    setDigestEvents: (state, action: PayloadAction<PersonalizedEvent[]>) => {
      state.digestEvents = action.payload;
    },

    /**
     * Add a single new event (for real-time updates)
     */
    addEvent: (state, action: PayloadAction<PersonalizedEvent>) => {
      // Check for duplicates by clusterId
      const exists = state.events.some(
        (e) => e.clusterId === action.payload.clusterId,
      );
      if (!exists) {
        state.events.unshift(action.payload);
      }
    },

    /**
     * Mark event as read
     */
    markEventRead: (state, action: PayloadAction<string>) => {
      state.readEventIds.add(action.payload);
    },

    /**
     * Mark multiple events as read
     */
    markEventsRead: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((id) => state.readEventIds.add(id));
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Clear all events (e.g., on logout)
     */
    clearEvents: (state) => {
      state.events = [];
      state.liveEvents = [];
      state.digestEvents = [];
      state.error = null;
      state.lastUpdated = null;
    },

    /**
     * Clear read events set (e.g., start of new day)
     */
    clearReadEvents: (state) => {
      state.readEventIds.clear();
    },
  },
});

export const {
  addEvent,
  clearEvents,
  clearReadEvents,
  markEventRead,
  markEventsRead,
  setDigestEvents,
  setError,
  setEvents,
  setLiveEvents,
  setLoading,
} = eventsSlice.actions;

export default eventsSlice.reducer;
