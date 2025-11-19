import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

import { colors, borderRadius } from '../theme';

export type ProgressVariant = 'linear' | 'circular';

export interface ProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Progress variant */
  variant?: ProgressVariant;
  /** Height for linear progress */
  height?: number;
  /** Size for circular progress */
  size?: number;
  /** Progress color */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Indeterminate mode (animated) */
  indeterminate?: boolean;
  /** Custom styles */
  style?: ViewStyle;
}

/**
 * Professional progress indicator component
 * Supports linear and circular variants
 */
const Progress = React.memo(
  ({
    value,
    variant = 'linear',
    height = 8,
    size = 48,
    color = colors.accent,
    backgroundColor = colors.backgroundCard,
    indeterminate = false,
    style,
  }: ProgressProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const indeterminateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (indeterminate) {
        const animation = Animated.loop(
          Animated.sequence([
            Animated.timing(indeterminateAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(indeterminateAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        );
        animation.start();
        return () => animation.stop();
      } else {
        Animated.spring(animatedValue, {
          toValue: Math.min(Math.max(value, 0), 100),
          friction: 8,
          useNativeDriver: false,
        }).start();
      }
    }, [value, indeterminate, animatedValue, indeterminateAnim]);

    if (variant === 'linear') {
      const width = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      });

      const translateX = indeterminateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-100%', '100%'],
      });

      return (
        <View
          style={[styles.linearContainer, { height, backgroundColor }, style]}
        >
          {indeterminate ? (
            <Animated.View
              style={[
                styles.linearBar,
                {
                  backgroundColor: color,
                  width: '50%',
                  transform: [{ translateX }],
                },
              ]}
            />
          ) : (
            <Animated.View
              style={[
                styles.linearBar,
                {
                  width,
                  backgroundColor: color,
                },
              ]}
            />
          )}
        </View>
      );
    }

    // Circular variant - simplified for React Native
    // (Full circular progress requires SVG or canvas)
    return (
      <View
        style={[
          styles.circularContainer,
          {
            width: size,
            height: size,
            backgroundColor,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.circularInner,
            {
              width: size - 8,
              height: size - 8,
              backgroundColor: colors.background,
            },
          ]}
        />
      </View>
    );
  },
);

Progress.displayName = 'Progress';

export default Progress;

const styles = StyleSheet.create({
  linearContainer: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  linearBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  circularContainer: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularInner: {
    borderRadius: borderRadius.full,
  },
});
