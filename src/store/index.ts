import { configureStore } from '@reduxjs/toolkit';

// Root reducer placeholder. Define your slices here when building features.
export const store = configureStore({
  reducer: {},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
