import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Redux slice to manage the user's watchlist of stock ticker symbols.
 *
 * The watchlist holds an array of uppercase ticker strings. Duplicate entries
 * are prevented by checking if the ticker already exists before pushing a new
 * value. Consumers of this slice should import and dispatch the exported
 * actions to add or remove tickers from the list.
 */
export interface WatchlistState {
  /**
   * Array of uppercase ticker symbols currently in the user's watchlist.
   */
  tickers: string[];
}

const initialState: WatchlistState = {
  tickers: [],
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    /**
     * Adds a ticker symbol to the watchlist. Symbols are normalized to
     * uppercase. If the symbol is already present it will not be added again.
     */
    addTicker: (state, action: PayloadAction<string>) => {
      const ticker = action.payload.toUpperCase().trim();
      if (ticker && !state.tickers.includes(ticker)) {
        state.tickers.push(ticker);
      }
    },
    /**
     * Removes a ticker symbol from the watchlist. If the symbol does not
     * exist in the list, this operation is a no‑op.
     */
    removeTicker: (state, action: PayloadAction<string>) => {
      state.tickers = state.tickers.filter((t) => t !== action.payload);
    },
    /**
     * Clears the entire watchlist. This can be used when a user logs out or
     * wishes to start over.
     */
    clear: (state) => {
      state.tickers = [];
    },
  },
});

export const { addTicker, removeTicker, clear } = watchlistSlice.actions;

export default watchlistSlice.reducer;
