/**
 * Storage utilities with type safety and error handling
 * Wrapper around AsyncStorage with additional features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from './logger';

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key: string,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Set item in storage
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    logger.debug(`Storage: Set ${key}`);
  } catch (error) {
    logger.error(`Storage: Failed to set ${key}`, error as Error);
    throw new StorageError(`Failed to set ${key}`, key);
  }
}

/**
 * Get item from storage
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    logger.debug(`Storage: Get ${key}`);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    logger.error(`Storage: Failed to get ${key}`, error as Error);
    throw new StorageError(`Failed to get ${key}`, key);
  }
}

/**
 * Remove item from storage
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    logger.debug(`Storage: Removed ${key}`);
  } catch (error) {
    logger.error(`Storage: Failed to remove ${key}`, error as Error);
    throw new StorageError(`Failed to remove ${key}`, key);
  }
}

/**
 * Clear all storage
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
    logger.info('Storage: Cleared all data');
  } catch (error) {
    logger.error('Storage: Failed to clear', error as Error);
    throw new StorageError('Failed to clear storage', 'all');
  }
}

/**
 * Get all keys
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    logger.debug(`Storage: Got ${keys.length} keys`);
    return keys;
  } catch (error) {
    logger.error('Storage: Failed to get keys', error as Error);
    throw new StorageError('Failed to get all keys', 'keys');
  }
}

/**
 * Get multiple items
 */
export async function multiGet<T>(
  keys: string[],
): Promise<Record<string, T | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, T | null> = {};

    pairs.forEach(([key, value]) => {
      result[key] = value ? JSON.parse(value) : null;
    });

    logger.debug(`Storage: Got ${keys.length} items`);
    return result;
  } catch (error) {
    logger.error('Storage: Failed to get multiple items', error as Error);
    throw new StorageError('Failed to get multiple items', keys.join(','));
  }
}

/**
 * Set multiple items
 */
export async function multiSet<T>(items: Record<string, T>): Promise<void> {
  try {
    const pairs = Object.entries(items).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]) as [string, string][];

    await AsyncStorage.multiSet(pairs);
    logger.debug(`Storage: Set ${pairs.length} items`);
  } catch (error) {
    logger.error('Storage: Failed to set multiple items', error as Error);
    throw new StorageError('Failed to set multiple items', 'multiple');
  }
}

/**
 * Storage keys constants
 */
export const StorageKeys = {
  USER_PREFERENCES: '@user_preferences',
  WATCHLIST: '@watchlist',
  THEME: '@theme',
  LANGUAGE: '@language',
  LAST_SYNC: '@last_sync',
  CACHE: '@cache',
} as const;
