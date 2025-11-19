/**
 * Utility functions for formatting data
 */

/**
 * Format number with thousand separators
 * @example formatNumber(1234567) => "1,234,567"
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ja-JP');
};

/**
 * Format date to Japanese format
 * @example formatDate(new Date()) => "2025年11月19日"
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date and time to Japanese format
 * @example formatDateTime(new Date()) => "2025年11月19日 15:30"
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format relative time (e.g., "2時間前")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'たった今';
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return formatDate(date);
  }
};

/**
 * Truncate text with ellipsis
 * @example truncateText("Long text here", 10) => "Long text..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Validate ticker symbol (alphanumeric, 1-10 chars)
 */
export const isValidTicker = (ticker: string): boolean => {
  return /^[A-Z0-9]{1,10}$/.test(ticker.toUpperCase());
};

/**
 * Format ticker symbol (uppercase, trimmed)
 */
export const formatTicker = (ticker: string): string => {
  return ticker.trim().toUpperCase();
};
