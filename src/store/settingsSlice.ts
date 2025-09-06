import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * User preferences and settings for controlling notification behaviour
 * and other configurable aspects of the application. Settings are kept
 * deliberately simple for the MVP but can be extended in future versions.
 */
export interface SettingsState {
  /**
   * Whether high‑importance events should trigger immediate push
   * notifications. When false, even high importance events will be
   * deferred to the next digest.
   */
  highImmediate: boolean;
  /**
   * Maximum number of notifications per day across all tickers. If the
   * notification budget is exhausted, further events are rolled into the
   * digest.
   */
  dailyLimit: number;
  /**
   * Whether the user wants to receive follow‑up notifications only (no
   * initial alerts). This corresponds to the "続報のみ受け取る" action.
   */
  followUpsOnly: boolean;
  /**
   * Whether notifications should be silenced for a temporary period. When
   * true, push notifications will not be shown until the quiet period
   * expires.
   */
  quietMode: boolean;
}

const initialState: SettingsState = {
  highImmediate: true,
  dailyLimit: 5,
  followUpsOnly: false,
  quietMode: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHighImmediate: (state, action: PayloadAction<boolean>) => {
      state.highImmediate = action.payload;
    },
    setDailyLimit: (state, action: PayloadAction<number>) => {
      state.dailyLimit = action.payload;
    },
    setFollowUpsOnly: (state, action: PayloadAction<boolean>) => {
      state.followUpsOnly = action.payload;
    },
    setQuietMode: (state, action: PayloadAction<boolean>) => {
      state.quietMode = action.payload;
    },
  },
});

export const {
  setHighImmediate,
  setDailyLimit,
  setFollowUpsOnly,
  setQuietMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;