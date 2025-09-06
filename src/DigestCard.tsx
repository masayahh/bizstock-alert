import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Props accepted by the DigestCard component. This component represents one
 * entry in the scheduled digest sent at 9:15/12:15/15:45. It displays
 * summarised information about an event along with the importance chip and
 * a short note explaining why the event matters.
 */
export interface DigestCardProps {
  ticker: string;
  company: string;
  headline: string;
  importance: '高' | '中' | '低';
  priceChange: number;
  source: string;
  time: string; // formatted time like "09:12"
  why?: string; // optional 18‑character note explaining significance
}

export default function DigestCard({
  ticker,
  company,
  headline,
  importance,
  priceChange,
  source,
  time,
  why,
}: DigestCardProps) {
  const priceStr = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(
    1
  )}%`;

  // Choose chip styles based on importance
  const chipStyle =
    importance === '高'
      ? styles.chipHigh
      : importance === '中'
      ? styles.chipMid
      : styles.chipLow;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.company}>{company}</Text>
        <View style={[styles.chip, chipStyle]}>
          <Text style={styles.chipText}>{importance}</Text>
        </View>
      </View>
      <Text style={styles.headline} numberOfLines={2} ellipsizeMode="tail">
        {headline}
      </Text>
      <View style={styles.row}>
        <Text style={styles.meta}>{priceStr}</Text>
        <Text style={styles.meta}>｜{source}</Text>
        <Text style={styles.meta}>｜{time}</Text>
      </View>
      {why ? (
        <Text style={styles.why} numberOfLines={1} ellipsizeMode="tail">
          なぜ大事か: {why}
        </Text>
      ) : null}
    </View>
  );
}

const COLORS = {
  card: '#0b0f14',
  text: '#ffffff',
  border: 'rgba(255,255,255,0.10)',
  chipHigh: '#f43f5e', // rose for high importance text with white 10% chip
  chipMid: '#f59e0b', // amber for medium
  chipLow: '#9ca3af', // gray for low
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticker: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
    fontFeatureSettings: '"tnum" 1',
  },
  company: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  chipHigh: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipMid: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipLow: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  headline: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  meta: {
    color: COLORS.text,
    fontSize: 12,
    marginRight: 4,
    fontFeatureSettings: '"tnum" 1',
  },
  why: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
  },
});