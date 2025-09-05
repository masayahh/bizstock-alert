/**
 * Fetch the current stock price for a given symbol.
 *
 * This is a placeholder implementation. In a future phase you should
 * integrate with a real market data provider (e.g. Alpha Vantage,
 * Yahoo Finance, etc.) that offers 15‑minute delayed quotes. For now
 * this function returns a hard‑coded value to allow the rest of the app
 * to compile and run.
 *
 * @param symbol Stock ticker symbol (e.g. 'AAPL', '7203.T')
 * @returns Resolved promise with a numeric price in the currency of the symbol.
 */
export async function fetchStockPrice(symbol: string): Promise<number> {
  console.warn(
    `fetchStockPrice called with symbol ${symbol}. This is a stub implementation; integrate a real API in the future.`,
  );
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return 1000;
}
