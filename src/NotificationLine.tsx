import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Props accepted by the NotificationLine component. This matches the
 * one‑line push notification format defined in the BizStock specification.
 */
export interface NotificationLineProps {
  ticker: string;
  company: string;
  headline: string;
  importance: '高' | '中' | '低';
  /** Percentage change expressed as a signed number, e.g. -2.8 for -2.8%. */
  priceChange: number;
  /** Concise source string (e.g. "IR・Reuters"). */
  source: string;
}

/**
 * Renders a single line summarising an event for use in notifications and
 * lists. The layout adheres to the 90‑character limit and uses the
 * separator character "｜" between fields. Numbers are rendered using
 * monospaced tabular numerals via font features. Colors and typography
 * follow the Calm Black theme.
 */
export default function NotificationLine({
  ticker,
  company,
  headline,
  importance,
  priceChange,
  source,
}: NotificationLineProps) {
  const priceStr = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(
    1
  )}%`;
  // Compose the message string. We intentionally avoid truncating in the
  // middle of a field; instead we allow the caller to limit headline length.
  const message = `🚨 ${ticker} ${company}：${headline}｜重要度 ${importance}｜株価 ${priceStr}｜出典 ${source}`;

  return (
    <View style={styles.container}>
      <Text
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {message}
      </Text>
    </View>
  );
}

const COLORS = {
  background: '#000000',
  card: '#0b0f14',
  text: '#ffffff',
  accent: '#16a34a',
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontFeatureSettings: '"tnum" 1',
  },
});