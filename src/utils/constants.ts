/**
 * App-wide constants
 */

export const APP_NAME = 'BizStock Alert';
export const APP_SUBTITLE = 'リアルタイムIR通知';

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

/**
 * Default toast duration in milliseconds
 */
export const TOAST_DURATION = 3000;

/**
 * Maximum number of items to display
 */
export const MAX_ITEMS = {
  events: 10,
  notifications: 10,
  tickers: 20,
} as const;

/**
 * Ticker validation regex
 */
export const TICKER_REGEX = /^[A-Z0-9]{1,10}$/;

/**
 * API endpoints (placeholder - update with actual endpoints)
 */
export const API_ENDPOINTS = {
  events: '/api/events',
  notifications: '/api/notifications',
  tickers: '/api/tickers',
} as const;

/**
 * Importance levels
 */
export const IMPORTANCE_LEVELS = ['強', '中', '弱'] as const;
export type ImportanceLevel = (typeof IMPORTANCE_LEVELS)[number];

/**
 * Filter types
 */
export const FILTER_TYPES = ['all', 'high', 'medium', 'low'] as const;
export type FilterType = (typeof FILTER_TYPES)[number];

/**
 * Sort types
 */
export const SORT_TYPES = ['time', 'importance'] as const;
export type SortType = (typeof SORT_TYPES)[number];
