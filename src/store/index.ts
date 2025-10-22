import { configureStore } from '@reduxjs/toolkit';

// Bring in reducers from individual slices. As additional state slices
// are added to the application they should be imported here and added
// to the root reducer below.
import eventsReducer from './eventsSlice';
import notificationsReducer from './notificationsSlice';
import settingsReducer from './settingsSlice';
import watchlistReducer from './watchlistSlice';

/**
 * Configure the Redux store for the BizStock application. This store holds
 * global state such as the user's watchlist. Additional reducers should be
 * registered here when new features are implemented.
 */
export const store = configureStore({
  reducer: {
    // Slice holding the list of ticker symbols the user is following.
    watchlist: watchlistReducer,
    // Slice containing pending and past notifications.  New notifications are
    // prepended to ensure most recent alerts appear first.
    notifications: notificationsReducer,
    // Slice storing user adjustable settings such as notification limits.
    settings: settingsReducer,
    // Slice managing personalized events from the data pipeline (Phase 1-5).
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Set objects in eventsSlice.readEventIds
        ignoredPaths: ['events.readEventIds'],
        ignoredActions: ['events/markEventRead', 'events/markEventsRead'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself. These
// types are useful when selecting from the state or dispatching actions.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
