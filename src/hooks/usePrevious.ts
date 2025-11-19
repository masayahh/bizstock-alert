import { useEffect, useRef } from 'react';

/**
 * Previous value hook - stores the previous value of a variable
 * @param value - The value to track
 * @returns The previous value
 *
 * @example
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * console.log(`Current: ${count}, Previous: ${previousCount}`);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;
