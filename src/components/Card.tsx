import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';

import { colors, spacing, borderRadius, shadows } from '../theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: CardVariant;
  /** Pressable card */
  pressable?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Custom styles */
  style?: ViewStyle;
  /** Disable press animation */
  disableAnimation?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Professional card component with multiple variants
 * Supports elevated, outlined, and filled styles
 */
const Card = React.memo(
  ({
    children,
    variant = 'elevated',
    pressable = false,
    onPress,
    style,
    disableAnimation = false,
    accessibilityLabel,
  }: CardProps) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      if (!disableAnimation && pressable) {
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (!disableAnimation && pressable) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    };

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: colors.backgroundCard,
            ...shadows.md,
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          };
        case 'filled':
          return {
            backgroundColor: colors.backgroundCardLight,
          };
      }
    };

    const cardContent = (
      <Animated.View
        style={[
          styles.card,
          getVariantStyles(),
          pressable && { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );

    if (pressable && onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    return cardContent;
  },
);

Card.displayName = 'Card';

export default Card;

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
});
