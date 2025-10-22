import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
 * the Calm Black theme.
 */
export default function NotificationLine({
  ticker,
  company,
  headline,
  importance,
  source,
}: NotificationLineProps) {
  // Format: 🚨 7203 トヨタ｜生産計画を更新 影響:中〔出典:会社IR/PR〕
  const message = `🚨 ${ticker} ${company}｜${headline} 影響:${importance}〔出典:${source}〕`;

  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
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
