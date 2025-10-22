import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export interface Source {
  name: string;
  url: string;
}

/**
 * Props for the EventSheet component. This sheet displays a detailed view
 * of an event including the full summary, sources and user actions.
 */
export interface EventSheetProps {
  summary: string;
  sources: Source[];
  onFollowUpsOnly?: () => void;
  onQuiet?: () => void;
}

export default function EventSheet({
  summary,
  sources,
  onFollowUpsOnly,
  onQuiet,
}: EventSheetProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={styles.summary}>{summary}</Text>
      <Text style={styles.sectionHeading}>出典</Text>
      {sources.map((src) => (
        <Text
          key={src.url}
          style={styles.source}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {src.name}: {src.url}
        </Text>
      ))}
      <View style={styles.actions}>
        {onFollowUpsOnly && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onFollowUpsOnly}
            accessibilityLabel="Follow ups only"
          >
            <Text style={styles.actionText}>続報のみ受け取る</Text>
          </TouchableOpacity>
        )}
        {onQuiet && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onQuiet}
            accessibilityLabel="Quiet for 2 hours"
          >
            <Text style={styles.actionText}>2時間 静かにする</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const COLORS = {
  background: '#0b0f14',
  text: '#ffffff',
  border: 'rgba(255,255,255,0.10)',
  accent: '#16a34a',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summary: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  source: {
    color: COLORS.text,
    fontSize: 12,
    marginBottom: 2,
    textDecorationLine: 'underline',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
