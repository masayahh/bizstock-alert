import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius, shadows } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Optional icon (emoji or component) */
  icon?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom styles */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

/**
 * Professional button component with animations and haptic feedback
 * Supports multiple variants, sizes, and states
 */
const Button = React.memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    fullWidth = false,
    icon,
    loading = false,
    style,
    accessibilityLabel,
    accessibilityHint,
  }: ButtonProps) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [spinValue] = useState(new Animated.Value(0));

    // Loading spinner animation
    React.useEffect(() => {
      if (loading) {
        const spinAnimation = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        );
        spinAnimation.start();
        return () => spinAnimation.stop();
      }
    }, [loading, spinValue]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      if (!disabled && !loading) {
        onPress();
      }
    };

    // Get variant styles
    const getVariantStyles = (): {
      container: ViewStyle;
      text: TextStyle;
    } => {
      switch (variant) {
        case 'primary':
          return {
            container: {
              backgroundColor: disabled ? colors.disabled : colors.accent,
              ...shadows.md,
            },
            text: { color: colors.text },
          };
        case 'secondary':
          return {
            container: {
              backgroundColor: disabled
                ? colors.disabled
                : colors.backgroundCard,
              borderWidth: 1,
              borderColor: disabled ? colors.border : colors.accent,
            },
            text: { color: disabled ? colors.disabledText : colors.accent },
          };
        case 'danger':
          return {
            container: {
              backgroundColor: disabled ? colors.disabled : colors.error,
              ...shadows.md,
            },
            text: { color: colors.text },
          };
        case 'ghost':
          return {
            container: {
              backgroundColor: 'transparent',
            },
            text: { color: disabled ? colors.disabledText : colors.accent },
          };
      }
    };

    // Get size styles
    const getSizeStyles = (): {
      container: ViewStyle;
      text: TextStyle;
    } => {
      switch (size) {
        case 'small':
          return {
            container: {
              paddingVertical: spacing[2],
              paddingHorizontal: spacing[3],
            },
            text: textStyles.buttonSmall,
          };
        case 'medium':
          return {
            container: {
              paddingVertical: spacing[3],
              paddingHorizontal: spacing[5],
            },
            text: textStyles.button,
          };
        case 'large':
          return {
            container: {
              paddingVertical: spacing[4],
              paddingHorizontal: spacing[6],
            },
            text: textStyles.buttonLarge,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        <Animated.View
          style={[
            styles.container,
            variantStyles.container,
            sizeStyles.container,
            fullWidth && styles.fullWidth,
            { transform: [{ scale: scaleAnim }] },
            style,
          ]}
        >
          {loading ? (
            <Animated.Text
              style={[styles.loadingIcon, { transform: [{ rotate: spin }] }]}
            >
              ⟳
            </Animated.Text>
          ) : (
            icon && <Text style={styles.icon}>{icon}</Text>
          )}
          <Text style={[sizeStyles.text, variantStyles.text, styles.text]}>
            {title}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

export default Button;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  loadingIcon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
});
