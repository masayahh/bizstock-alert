import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { colors, textStyles, spacing, borderRadius } from '../theme';

export interface EmptyStateProps {
  /** Icon to display (emoji or component) */
  icon: string;
  /** Main message */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional action button */
  action?: React.ReactNode;
}

/**
 * Professional empty state component
 * Used when there's no data to display
 */
const EmptyState = React.memo(
  ({ icon, title, subtitle, action }: EmptyStateProps) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {action && <View style={styles.action}>{action}</View>}
      </Animated.View>
    );
  },
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    marginVertical: spacing[4],
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h4,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  action: {
    marginTop: spacing[4],
  },
});
