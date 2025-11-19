import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook for fade-in animation
 */
export const useFadeIn = (duration = 500, delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return opacity;
};

/**
 * Hook for slide-in animation
 */
export const useSlideIn = (
  from: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
  duration = 500,
  delay = 0,
) => {
  const translateValue = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(translateValue, {
      toValue: 0,
      friction: 8,
      tension: 40,
      delay,
      useNativeDriver: true,
    }).start();
  }, [translateValue, delay]);

  const getTransform = () => {
    switch (from) {
      case 'top':
        return {
          translateY: translateValue.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
          }),
        };
      case 'bottom':
        return { translateY: translateValue };
      case 'left':
        return {
          translateX: translateValue.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
          }),
        };
      case 'right':
        return { translateX: translateValue };
    }
  };

  return getTransform();
};

/**
 * Hook for scale animation
 */
export const useScale = (from = 0.95, to = 1, duration = 400, delay = 0) => {
  const scale = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: to,
      friction: 7,
      tension: 40,
      delay,
      useNativeDriver: true,
    }).start();
  }, [scale, to, delay]);

  return scale;
};

/**
 * Hook for rotation animation
 */
export const useRotation = (duration = 1000, continuous = true) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = continuous
      ? Animated.loop(
          Animated.timing(rotation, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        )
      : Animated.timing(rotation, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        });

    animation.start();

    return () => {
      if (continuous) {
        animation.stop();
      }
    };
  }, [rotation, duration, continuous]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return rotate;
};

/**
 * Hook for pulse animation
 */
export const usePulse = (scale = 1.05, duration = 1000) => {
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: scale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulseValue, scale, duration]);

  return pulseValue;
};

/**
 * Hook for press animation (scale down/up)
 */
export const usePressAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
};
