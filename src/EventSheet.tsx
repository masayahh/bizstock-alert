import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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
  visible: boolean;
  summary: string;
  sources: Source[];
  onClose: () => void;
  onFollowUpsOnly?: () => void;
  onQuiet?: () => void;
}

export default function EventSheet({
  visible,
  summary,
  sources,
  onClose,
  onFollowUpsOnly,
  onQuiet,
}: EventSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>イベント詳細</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: 16 }}
          bounces={false}
        >
          <Text style={styles.summary}>{summary}</Text>
          <Text style={styles.sectionHeading}>出典</Text>
          {sources.map((src, idx) => (
            <Text
              key={`${src.url}-${idx}`}
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
      </View>
    </Modal>
  );
}

const COLORS = {
  background: '#0b0f14',
  text: '#ffffff',
  border: 'rgba(255,255,255,0.10)',
  accent: '#16a34a',
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '300',
  },
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
