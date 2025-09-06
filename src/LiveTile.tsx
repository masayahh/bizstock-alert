import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Props for the LiveTile component. The tile shows a mini sparkline
 * (here represented as a placeholder), the latest percent change and a
 * short follow‑up note.
 */
export interface LiveTileProps {
  ticker: string;
  percentChange: number;
  note: string;
}

export default function LiveTile({
  ticker,
  percentChange,
  note,
}: LiveTileProps) {
  const changeStr = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(
    1
  )}%`;
  return (
    <View style={styles.tile}>
      <Text style={styles.ticker}>{ticker}</Text>
      {/* Placeholder for sparkline; in a real implementation this could be a
      SVG or canvas drawing. */}
      <View style={styles.sparkPlaceholder} />
      <Text style={styles.percent}>{changeStr}</Text>
      <Text style={styles.note} numberOfLines={1} ellipsizeMode="tail">
        {note}
      </Text>
    </View>
  );
}

const COLORS = {
  tile: '#0b0f14',
  text: '#ffffff',
  positive: '#22c55e',
  negative: '#f43f5e',
};

const styles = StyleSheet.create({
  tile: {
    width: 150,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.tile,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ticker: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  sparkPlaceholder: {
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    marginBottom: 4,
  },
  percent: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  note: {
    color: COLORS.text,
    fontSize: 12,
  },
});