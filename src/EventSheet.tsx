import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Linking,
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

const EventSheet = React.memo(
  ({
    visible,
    summary,
    sources,
    onClose,
    onFollowUpsOnly,
    onQuiet,
  }: EventSheetProps) => {
    // Slide-up animation
    const [slideAnim] = useState(new Animated.Value(0));
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 1,
            friction: 9,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, slideAnim, fadeAnim]);

    const handleSourcePress = async (url: string) => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    };

    return (
      <Modal
        visible={visible}
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={onClose}
        transparent
      >
        {/* Background overlay with blur effect */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Sheet content */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>イベント詳細</Text>
              <Text style={styles.headerSubtitle}>Event Details</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              accessibilityHint="モーダルを閉じます"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces
          >
            {/* Summary Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionHeading}>概要</Text>
              </View>
              <Text
                style={styles.summary}
                accessibilityRole="text"
                accessibilityLabel={`概要: ${summary}`}
              >
                {summary}
              </Text>
            </View>

            {/* Sources Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionHeading}>出典</Text>
              </View>
              {sources.map((src, idx) => (
                <TouchableOpacity
                  key={`${src.url}-${idx}`}
                  style={styles.sourceCard}
                  onPress={() => handleSourcePress(src.url)}
                  accessibilityRole="link"
                  accessibilityLabel={`出典: ${src.name}`}
                  accessibilityHint="タップして開く"
                >
                  <Text style={styles.sourceName}>{src.name}</Text>
                  <Text
                    style={styles.sourceUrl}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {src.url}
                  </Text>
                  <View style={styles.linkIcon}>
                    <Text style={styles.linkIconText}>🔗</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions Section */}
            {(onFollowUpsOnly || onQuiet) && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionHeading}>アクション</Text>
                </View>
                <View style={styles.actions}>
                  {onFollowUpsOnly && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPrimary]}
                      onPress={onFollowUpsOnly}
                      accessibilityRole="button"
                      accessibilityLabel="続報のみ受け取る"
                      accessibilityHint="このイベントの続報のみ通知します"
                    >
                      <Text style={styles.actionIcon}>📌</Text>
                      <Text style={styles.actionText}>続報のみ受け取る</Text>
                    </TouchableOpacity>
                  )}
                  {onQuiet && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.actionButtonSecondary,
                      ]}
                      onPress={onQuiet}
                      accessibilityRole="button"
                      accessibilityLabel="2時間 静かにする"
                      accessibilityHint="2時間通知を一時停止します"
                    >
                      <Text style={styles.actionIcon}>🔕</Text>
                      <Text style={styles.actionText}>2時間 静かにする</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Modal>
    );
  },
);

EventSheet.displayName = 'EventSheet';

export default EventSheet;

const COLORS = {
  background: '#000000',
  backgroundElevated: '#0a0f14',
  card: '#111827', // Matching App.tsx
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: 'rgba(255,255,255,0.08)',
  accent: '#10b981', // Matching App.tsx
  accentLight: '#34d399',
  accentDark: '#059669',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  link: '#60a5fa',
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  overlayTouchable: {
    flex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.backgroundElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 2,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  summary: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: -0.2,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sourceCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sourceUrl: {
    color: COLORS.link,
    fontSize: 12,
    textDecorationLine: 'underline',
    paddingRight: 30,
  },
  linkIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  linkIconText: {
    fontSize: 16,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.accent,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
