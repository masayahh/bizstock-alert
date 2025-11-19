import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';

/**
 * Props for the LiveTile component. The tile displays the latest event
 * or status for a stock ticker. Aligned with product spec: no price display.
 */
export interface LiveTileProps {
  ticker: string;
  /** Latest event headline or status (e.g., "新規開示なし", "決算発表") */
  status: string;
  /** Event importance: 強(strong), 中(medium), 弱(weak), or null for no event */
  importance: '強' | '中' | '弱' | null;
  /** Optional onPress handler */
  onPress?: () => void;
}

const LiveTile = React.memo(
  ({ ticker, status, importance, onPress }: LiveTileProps) => {
    // Fade-in and slide animation on mount
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));
    const [pressAnim] = useState(new Animated.Value(1));

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim]);

    // Press animation handlers
    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    // Map importance to display color and pill badge with gradient
    const getPillStyle = () => {
      switch (importance) {
        case '強':
          return {
            backgroundColor: COLORS.high,
            label: '強',
            icon: '🔴',
            gradient: [COLORS.high, COLORS.highDark],
          };
        case '中':
          return {
            backgroundColor: COLORS.medium,
            label: '中',
            icon: '🟡',
            gradient: [COLORS.medium, COLORS.mediumDark],
          };
        case '弱':
          return {
            backgroundColor: COLORS.low,
            label: '弱',
            icon: '🟢',
            gradient: [COLORS.low, COLORS.lowDark],
          };
        default:
          return {
            backgroundColor: COLORS.neutral,
            label: '－',
            icon: '⚪',
            gradient: [COLORS.neutral, COLORS.neutralDark],
          };
      }
    };

    const pill = getPillStyle();

    const TileContent = (
      <Animated.View
        style={[
          styles.tile,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: pressAnim }],
          },
        ]}
      >
        {/* Gradient background effect */}
        <View style={styles.gradientOverlay} />

        <View style={styles.header}>
          <View style={styles.tickerContainer}>
            <Text style={styles.ticker}>{ticker}</Text>
            <View style={styles.tickerUnderline} />
          </View>
          <View
            style={[styles.pill, { backgroundColor: pill.backgroundColor }]}
          >
            <Text style={styles.pillIcon}>{pill.icon}</Text>
            <Text style={styles.pillText}>{pill.label}</Text>
          </View>
        </View>

        <Text
          style={styles.status}
          numberOfLines={3}
          ellipsizeMode="tail"
          accessibilityLabel={`${ticker}のステータス: ${status}`}
          accessibilityRole="text"
        >
          {status}
        </Text>

        {/* Bottom accent line */}
        <View style={styles.bottomAccent} />
      </Animated.View>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`${ticker}のタイルを開く`}
          accessibilityHint="タップして詳細を表示"
        >
          {TileContent}
        </TouchableOpacity>
      );
    }

    return TileContent;
  },
);

LiveTile.displayName = 'LiveTile';

export default LiveTile;

const COLORS = {
  tile: '#111827', // Matching App.tsx
  tileElevated: '#1f2937',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  accent: '#10b981', // Matching App.tsx
  border: 'rgba(255,255,255,0.08)',
  high: '#ef4444', // Red for high importance
  highDark: '#dc2626',
  medium: '#f59e0b', // Amber for medium
  mediumDark: '#d97706',
  low: '#10b981', // Green for low
  lowDark: '#059669',
  neutral: '#374151', // No event - dark gray
  neutralDark: '#1f2937',
  shadow: 'rgba(0, 0, 0, 0.5)',
  gradient: 'rgba(16, 185, 129, 0.05)',
};

const styles = StyleSheet.create({
  tile: {
    width: 170,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.tile,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
    // Professional shadow with more depth
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.gradient,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1,
  },
  tickerContainer: {
    position: 'relative',
  },
  ticker: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tickerUnderline: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  pill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  pillIcon: {
    fontSize: 9,
    marginRight: 3,
  },
  pillText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  status: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.2,
    zIndex: 1,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
});
