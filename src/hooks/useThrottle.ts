import { useCallback, useRef } from 'react';

/**
 * Throttle hook - limits function execution frequency
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds
 * @returns The throttled function
 *
 * @example
 * const handleScroll = useThrottle((event) => {
 *   console.log('Scrolled', event);
 * }, 200);
 *
 * <ScrollView onScroll={handleScroll} />
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRan.current = Date.now();
          },
          delay - (now - lastRan.current),
        );
      }
    },
    [callback, delay],
  );
}

export default useThrottle;
