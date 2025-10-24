/**
 * Debug Screen
 *
 * Development-only screen for testing features without real API calls.
 * Accessible via long-press on app title.
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';
import { addEvent, setEvents, setLiveEvents } from './store/eventsSlice';
import { addNotification } from './store/notificationsSlice';
import {
  generateMockDigestEvents,
  generateMockLiveTileEvents,
  generateMockPersonalizedEvent,
  isMockMode,
} from './utils/mockData';

interface DebugScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugScreen({ visible, onClose }: DebugScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const watchlist = useSelector((state: RootState) => state.watchlist.tickers);
  const events = useSelector((state: RootState) => state.events.events);
  const liveEvents = useSelector((state: RootState) => state.events.liveEvents);
  const notifications = useSelector(
    (state: RootState) => state.notifications.items,
  );
  const settings = useSelector((state: RootState) => state.settings);

  const [lastAction, setLastAction] = useState<string>('');

  const handleGenerateMockEvents = () => {
    if (watchlist.length === 0) {
      Alert.alert('エラー', 'ウォッチリストに銘柄を追加してください');
      return;
    }

    const mockEvents = generateMockLiveTileEvents(watchlist);
    dispatch(setEvents(mockEvents));
    dispatch(setLiveEvents(mockEvents.slice(0, 3)));
    setLastAction(`${mockEvents.length}個のモックイベントを生成しました`);
  };

  const handleGenerateDigestEvents = () => {
    if (watchlist.length === 0) {
      Alert.alert('エラー', 'ウォッチリストに銘柄を追加してください');
      return;
    }

    const digestEvents = generateMockDigestEvents(watchlist);
    dispatch(setEvents(digestEvents));
    setLastAction(
      `${digestEvents.length}個のダイジェストイベントを生成しました`,
    );
  };

  const handleAddSingleEvent = () => {
    if (watchlist.length === 0) {
      Alert.alert('エラー', 'ウォッチリストに銘柄を追加してください');
      return;
    }

    const event = generateMockPersonalizedEvent({
      primaryTicker: watchlist[0],
      allTickers: [watchlist[0]],
    });
    dispatch(addEvent(event));
    setLastAction(`新規イベントを追加: ${event.title.slice(0, 30)}...`);
  };

  const handleSendTestNotification = () => {
    const notification = {
      id: `test-${Date.now()}`,
      ticker: watchlist[0] || '7203',
      message: 'テスト通知: これは開発用の通知です',
      importance: '中' as const,
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch(addNotification(notification));
    setLastAction('テスト通知を送信しました');
  };

  const handleClearAll = () => {
    Alert.alert(
      '確認',
      'すべてのイベントと通知をクリアしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: () => {
            dispatch(setEvents([]));
            dispatch(setLiveEvents([]));
            setLastAction('すべてクリアしました');
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ デバッグメニュー</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 現在の状態</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>モード:</Text>
              <Text style={styles.statusValue}>
                {isMockMode() ? '🎭 モック' : '🌐 本番'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>ウォッチリスト:</Text>
              <Text style={styles.statusValue}>
                {watchlist.length}銘柄 {watchlist.join(', ')}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>イベント:</Text>
              <Text style={styles.statusValue}>{events.length}件</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Live Tile:</Text>
              <Text style={styles.statusValue}>{liveEvents.length}件</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>通知:</Text>
              <Text style={styles.statusValue}>{notifications.length}件</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>高重要度即時:</Text>
              <Text style={styles.statusValue}>
                {settings.highImmediate ? 'ON' : 'OFF'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>静音モード:</Text>
              <Text style={styles.statusValue}>
                {settings.quietMode ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ アクション</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleGenerateMockEvents}
            >
              <Text style={styles.buttonText}>
                🎲 Live Tileイベント生成（3件）
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleGenerateDigestEvents}
            >
              <Text style={styles.buttonText}>
                📰 ダイジェストイベント生成（8件）
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleAddSingleEvent}
            >
              <Text style={styles.buttonText}>➕ 単一イベント追加</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendTestNotification}
            >
              <Text style={styles.buttonText}>🔔 テスト通知送信</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleClearAll}
            >
              <Text style={styles.buttonText}>🗑️ すべてクリア</Text>
            </TouchableOpacity>
          </View>

          {/* Last Action */}
          {lastAction ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ 最後のアクション</Text>
              <Text style={styles.lastActionText}>{lastAction}</Text>
            </View>
          ) : null}

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ 情報</Text>
            <Text style={styles.infoText}>
              このデバッグ画面は開発用です。{'\n'}
              モックモードでは、APIキーなしでUIをテストできます。{'\n\n'}
              本番モードに切り替えるには：{'\n'}
              1. .envファイルでEXPO_PUBLIC_MOCK_MODE=false{'\n'}
              2. EXPO_PUBLIC_OPENAI_API_KEYを設定{'\n'}
              3. アプリを再起動
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const COLORS = {
  accent: '#16a34a',
  background: '#000000',
  border: 'rgba(255,255,255,0.10)',
  card: '#0b0f14',
  danger: '#dc2626',
  secondary: '#6b7280',
  text: '#ffffff',
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  lastActionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    marginTop: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusLabel: {
    color: COLORS.secondary,
    flex: 1,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusValue: {
    color: COLORS.text,
    flex: 2,
    fontSize: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
