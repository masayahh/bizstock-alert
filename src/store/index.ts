import { configureStore } from '@reduxjs/toolkit';

// Bring in reducers from individual slices. As additional state slices
// are added to the application they should be imported here and added
// to the root reducer below.
import watchlistReducer from './watchlistSlice';

/**
 * Configure the Redux store for the BizStock application. This store holds
 * global state such as the user's watchlist. Additional reducers should be
 * registered here when new features are implemented.
 */
export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself. These
// types are useful when selecting from the state or dispatching actions.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;