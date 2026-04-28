import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Notification } from '../store/notificationsSlice';
import { PersonalizedEvent } from '../types/events';
import { buildCapabilityShowcaseSummary } from '../utils/capabilityShowcase';

interface CapabilityShowcaseCardProps {
  events: PersonalizedEvent[];
  notifications: Notification[];
}

function getAlertModeLabel(mode: 'IMMEDIATE' | 'WATCH' | 'QUIET'): string {
  if (mode === 'IMMEDIATE') return '即時対応';
  if (mode === 'WATCH') return '監視強化';
  return '静穏運用';
}

export default function CapabilityShowcaseCard({
  events,
  notifications,
}: CapabilityShowcaseCardProps) {
  const summary = useMemo(
    () => buildCapabilityShowcaseSummary(events, notifications),
    [events, notifications],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚡ Capability Showcase</Text>
      <Text style={styles.headline}>{summary.headline}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Top Ticker</Text>
          <Text style={styles.statValue}>{summary.topTicker}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Alert Mode</Text>
          <Text style={styles.statValue}>
            {getAlertModeLabel(summary.alertMode)}
          </Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={styles.scoreTitle}>Signal Confidence</Text>
        <Text style={styles.scoreValue}>{summary.confidenceScore}%</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${summary.confidenceScore}%` },
              summary.confidenceScore >= 70
                ? styles.fillHigh
                : summary.confidenceScore >= 40
                  ? styles.fillMedium
                  : styles.fillLow,
            ]}
          />
        </View>
      </View>

      <Text style={styles.meta}>
        Events {summary.eventCount}件 / Notifications{' '}
        {summary.notificationCount}件
      </Text>
      <Text style={styles.meta}>
        強:{summary.impactBreakdown.strong} 中:{summary.impactBreakdown.medium}{' '}
        弱:
        {summary.impactBreakdown.weak} / 直近3h:{summary.recencyHotCount}件 /
        未読:
        {summary.unreadRate}%
      </Text>

      <View style={styles.evidenceBox}>
        {summary.evidencePoints.map((item) => (
          <Text key={item} style={styles.evidenceItem}>
            • {item}
          </Text>
        ))}
      </View>

      <Text style={styles.suggestion}>{summary.suggestedAction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: '#93C5FD',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  headline: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBlock: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
  scoreBlock: {
    backgroundColor: '#0B1220',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 10,
    marginBottom: 10,
  },
  scoreTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#A5B4FC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  fillHigh: {
    backgroundColor: '#22C55E',
  },
  fillMedium: {
    backgroundColor: '#F59E0B',
  },
  fillLow: {
    backgroundColor: '#EF4444',
  },
  meta: {
    color: '#D1D5DB',
    fontSize: 12,
    marginBottom: 6,
  },
  evidenceBox: {
    marginTop: 2,
    marginBottom: 8,
    gap: 4,
  },
  evidenceItem: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 18,
  },
  suggestion: {
    marginTop: 8,
    color: '#C7D2FE',
    fontSize: 13,
    lineHeight: 19,
  },
});
