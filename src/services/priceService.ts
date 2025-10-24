/**
 * [DEPRECATED / NOT IN USE PER PRODUCT SPEC]
 *
 * Fetch the current stock price for a given symbol.
 *
 * NOTE: Per product specification, price display is OUT OF SCOPE (非スコープ).
 * The app focuses on IR/PR/EDINET event notifications without showing
 * real-time or delayed price data. This function is kept for reference only
 * and is NOT used in the current implementation.
 *
 * If future requirements change to include delayed price display, this
 * function should be integrated with a real market data provider
 * (e.g. Alpha Vantage, Yahoo Finance, etc.) that offers 15‑minute delayed quotes.
 *
 * @param symbol Stock ticker symbol (e.g. 'AAPL', '7203.T')
 * @returns Resolved promise with a numeric price in the currency of the symbol.
 */
export async function fetchStockPrice(symbol: string): Promise<number> {
  console.warn(
    `[DEPRECATED] fetchStockPrice called with symbol ${symbol}. Price display is out of scope per product spec.`,
  );
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return 1000;
}
