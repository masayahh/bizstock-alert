import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
}

export default function LiveTile({
  ticker,
  status,
  importance,
}: LiveTileProps) {
  // Map importance to display color and pill badge
  const getPillStyle = () => {
    switch (importance) {
      case '強':
        return { color: COLORS.high, label: '強' };
      case '中':
        return { color: COLORS.medium, label: '中' };
      case '弱':
        return { color: COLORS.low, label: '弱' };
      default:
        return { color: COLORS.neutral, label: '－' };
    }
  };

  const pill = getPillStyle();

  return (
    <View style={styles.tile}>
      <View style={styles.header}>
        <Text style={styles.ticker}>{ticker}</Text>
        <View style={[styles.pill, { backgroundColor: pill.color }]}>
          <Text style={styles.pillText}>{pill.label}</Text>
        </View>
      </View>
      <Text style={styles.status} numberOfLines={2} ellipsizeMode="tail">
        {status}
      </Text>
    </View>
  );
}

const COLORS = {
  tile: '#0b0f14',
  text: '#ffffff',
  high: '#f43f5e', // 強 (high importance) - red
  medium: '#f59e0b', // 中 (medium importance) - amber
  low: '#6b7280', // 弱 (low importance) - gray
  neutral: '#374151', // No event - dark gray
};

const styles = StyleSheet.create({
  tile: {
    width: 160,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.tile,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticker: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '600',
  },
  status: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 16,
  },
});
