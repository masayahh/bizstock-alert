import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

/**
 * Local storage hook - persist state in AsyncStorage
 * @param key - The storage key
 * @param initialValue - The initial value
 * @returns [value, setValue, loading, error]
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 *
 * <Button onPress={() => setTheme('light')}>
 *   Switch to Light
 * </Button>
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Save value to storage
  const setValue = useCallback(
    async (value: T) => {
      try {
        setStoredValue(value);
        await AsyncStorage.setItem(key, JSON.stringify(value));
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    },
    [key],
  );

  return [storedValue, setValue, loading, error];
}

export default useLocalStorage;
