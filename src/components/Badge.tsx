import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { colors, textStyles, spacing, borderRadius } from '../theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  /** Badge label */
  label: string;
  /** Badge variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Optional icon (emoji or component) */
  icon?: string;
  /** Custom styles */
  style?: ViewStyle;
}

/**
 * Professional badge component for labels and tags
 * Supports multiple variants and sizes
 */
const Badge = React.memo(
  ({
    label,
    variant = 'default',
    size = 'medium',
    icon,
    style,
  }: BadgeProps) => {
    // Get variant styles
    const getVariantStyles = () => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: colors.backgroundCard,
            color: colors.text,
          };
        case 'success':
          return {
            backgroundColor: colors.success,
            color: colors.text,
          };
        case 'warning':
          return {
            backgroundColor: colors.warning,
            color: colors.text,
          };
        case 'error':
          return {
            backgroundColor: colors.error,
            color: colors.text,
          };
        case 'info':
          return {
            backgroundColor: colors.info,
            color: colors.text,
          };
      }
    };

    // Get size styles
    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return {
            paddingVertical: spacing[1] / 2,
            paddingHorizontal: spacing[2],
            fontSize: textStyles.caption.fontSize,
          };
        case 'medium':
          return {
            paddingVertical: spacing[1],
            paddingHorizontal: spacing[3],
            fontSize: textStyles.badge.fontSize,
          };
        case 'large':
          return {
            paddingVertical: spacing[2],
            paddingHorizontal: spacing[4],
            fontSize: textStyles.label.fontSize,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          style,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.label,
            {
              color: variantStyles.color,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 12,
    marginRight: spacing[1],
  },
  label: {
    ...textStyles.badge,
  },
});
