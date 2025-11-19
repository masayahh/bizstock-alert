import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

import { colors, borderRadius, spacing } from '../theme';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  /** Skeleton variant */
  variant?: SkeletonVariant;
  /** Width */
  width?: number | string;
  /** Height */
  height?: number;
  /** Custom styles */
  style?: ViewStyle;
  /** Animation speed (ms) */
  speed?: number;
}

/**
 * Skeleton loading component with shimmer effect
 * Used for content placeholders during loading
 */
const Skeleton = React.memo(
  ({
    variant = 'rectangular',
    width = '100%',
    height = 20,
    style,
    speed = 1200,
  }: SkeletonProps) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: speed,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: speed,
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return () => animation.stop();
    }, [shimmerAnim, speed]);

    const opacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'text':
          return {
            height,
            borderRadius: borderRadius.sm,
          };
        case 'circular':
          return {
            width: height,
            height,
            borderRadius: height / 2,
          };
        case 'rectangular':
          return {
            height,
            borderRadius: borderRadius.md,
          };
      }
    };

    return (
      <View style={[styles.container, { width }, getVariantStyles(), style]}>
        <Animated.View style={[styles.shimmer, { opacity }]} />
      </View>
    );
  },
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;

/**
 * Pre-built skeleton patterns for common use cases
 */
export const SkeletonPatterns = {
  /** Card skeleton */
  Card: () => (
    <View style={styles.pattern}>
      <Skeleton
        variant="rectangular"
        height={120}
        style={{ marginBottom: spacing[3] }}
      />
      <Skeleton
        variant="text"
        width="80%"
        style={{ marginBottom: spacing[2] }}
      />
      <Skeleton variant="text" width="60%" />
    </View>
  ),

  /** List item skeleton */
  ListItem: () => (
    <View
      style={[styles.pattern, { flexDirection: 'row', alignItems: 'center' }]}
    >
      <Skeleton
        variant="circular"
        height={40}
        style={{ marginRight: spacing[3] }}
      />
      <View style={{ flex: 1 }}>
        <Skeleton
          variant="text"
          width="70%"
          style={{ marginBottom: spacing[2] }}
        />
        <Skeleton variant="text" width="40%" height={14} />
      </View>
    </View>
  ),

  /** Avatar with text skeleton */
  Avatar: () => (
    <View
      style={[styles.pattern, { flexDirection: 'row', alignItems: 'center' }]}
    >
      <Skeleton
        variant="circular"
        height={48}
        style={{ marginRight: spacing[3] }}
      />
      <View style={{ flex: 1 }}>
        <Skeleton
          variant="text"
          width="50%"
          style={{ marginBottom: spacing[2] }}
        />
        <Skeleton variant="text" width="30%" height={14} />
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.textSecondary,
  },
  pattern: {
    padding: spacing[4],
  },
});
