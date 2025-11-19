import { useEffect, useRef } from 'react';

/**
 * Interval hook - setInterval with automatic cleanup
 * @param callback - The function to call
 * @param delay - The delay in milliseconds (null to pause)
 *
 * @example
 * const [count, setCount] = useState(0);
 *
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
