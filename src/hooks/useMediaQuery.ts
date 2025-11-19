import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface MediaQueryBreakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const DEFAULT_BREAKPOINTS: MediaQueryBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Media query hook - responsive breakpoints
 * @param breakpoints - Custom breakpoints (optional)
 * @returns Media query helpers
 *
 * @example
 * const { width, isSm, isMd, isLg, isXl } = useMediaQuery();
 *
 * if (isSm) {
 *   // Mobile layout
 * } else if (isMd) {
 *   // Tablet layout
 * }
 */
export function useMediaQuery(breakpoints = DEFAULT_BREAKPOINTS) {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    isSm: width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl,
    isPortrait: height > width,
    isLandscape: width > height,
  };
}

export default useMediaQuery;
