import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * Props accepted by the NotificationLine component. This matches the
 * one‑line push notification format defined in the BizStock specification.
 * Per product spec: no price display, only event info and impact level.
 */
export interface NotificationLineProps {
  ticker: string;
  company: string;
  headline: string;
  /** Impact level: 強(high), 中(medium), 弱(low) */
  importance: '強' | '中' | '弱';
  /** Concise source string (e.g. "会社IR/PR", "EDINET"). */
  source: string;
}

/**
 * Renders a single line summarising an event for use in notifications and
 * lists. The layout adheres to the 90‑character limit and uses the
 * separator character "｜" between fields. Per product spec: no price,
 * only event headline and impact level. Colors and typography follow
 * the Calm Black theme with professional animations and shadows.
 */
const NotificationLine = React.memo(
  ({
    ticker,
    company,
    headline,
    importance,
    source,
  }: NotificationLineProps) => {
    // Fade-in animation on mount
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.95));

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, scaleAnim]);

    // Get importance color and icon
    const getImportanceStyle = () => {
      switch (importance) {
        case '強':
          return { color: COLORS.high, icon: '🔴' };
        case '中':
          return { color: COLORS.medium, icon: '🟡' };
        case '弱':
          return { color: COLORS.low, icon: '🟢' };
      }
    };

    const impStyle = getImportanceStyle();

    // Format: 🚨 7203 トヨタ｜生産計画を更新 影響:中〔出典:会社IR/PR〕
    const message = `🚨 ${ticker} ${company}｜${headline} 影響:${importance}〔出典:${source}〕`;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.accentBar} />
        <View style={styles.content}>
          <View style={styles.importanceBadge}>
            <Text style={styles.importanceIcon}>{impStyle.icon}</Text>
            <Text style={[styles.importanceText, { color: impStyle.color }]}>
              {importance}
            </Text>
          </View>
          <Text
            style={styles.text}
            numberOfLines={2}
            ellipsizeMode="tail"
            accessibilityLabel={`通知: ${message}`}
            accessibilityRole="text"
          >
            {message}
          </Text>
        </View>
      </Animated.View>
    );
  },
);

NotificationLine.displayName = 'NotificationLine';

export default NotificationLine;

const COLORS = {
  background: '#000000',
  card: '#111827', // Deeper, matching App.tsx
  text: '#ffffff',
  textSecondary: '#9ca3af',
  accent: '#10b981', // Matching App.tsx accent
  border: 'rgba(255,255,255,0.08)', // More subtle
  high: '#ef4444', // Red for high importance
  medium: '#f59e0b', // Amber for medium
  low: '#10b981', // Green for low
  shadow: 'rgba(0, 0, 0, 0.5)',
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    // Professional shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
  },
  importanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  importanceIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  importanceText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontFeatureSettings: '"tnum" 1',
    letterSpacing: -0.2,
  },
});
