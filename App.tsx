import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';

import EventSheet from './src/EventSheet';
import LiveTile from './src/LiveTile';
import NotificationLine from './src/NotificationLine';
import SettingsBlock from './src/SettingsBlock';
import { useAppInit } from './src/hooks/useAppInit';
import store, { AppDispatch, RootState } from './src/store';
import { markEventRead } from './src/store/eventsSlice';
import { Notification } from './src/store/notificationsSlice';
import {
  setFollowUpsOnly,
  setHighImmediate,
  setQuietMode,
} from './src/store/settingsSlice';
import { addTicker, removeTicker } from './src/store/watchlistSlice';
import { PersonalizedEvent } from './src/types/events';

/**
 * Screen component that allows the user to manage their watchlist of ticker
 * symbols. Users can add tickers via a text input and remove them by tapping
 * the × next to each item. The UI follows the Calm Black design spec with
 * dark backgrounds, subtle borders and an accent color for interactive
 * elements.
 *
 * Integrated with Phase 1-5 services: data ingestion, clustering, personalization, ranking.
 */
function HomeScreen() {
  // Initialize app (fetch events on mount)
  useAppInit();

  // Access Redux state
  const tickers = useSelector((state: RootState) => state.watchlist.tickers);
  const notifications = useSelector(
    (state: RootState) => state.notifications.items,
  );
  const liveEvents = useSelector((state: RootState) => state.events.liveEvents);
  const allEvents = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const highImmediate = useSelector(
    (state: RootState) => state.settings.highImmediate,
  );
  const quietMode = useSelector((state: RootState) => state.settings.quietMode);
  const followUpsOnly = useSelector(
    (state: RootState) => state.settings.followUpsOnly,
  );

  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState('');

  // Currently selected event for displaying an EventSheet overlay
  const [selectedEvent, setSelectedEvent] = useState<PersonalizedEvent | null>(
    null,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      dispatch(addTicker(trimmed.toUpperCase()));
      setInput('');
    }
  };

  // Convert live events to ticker status map for LiveTile display
  const tickerStatusMap: Record<
    string,
    { status: string; importance: '強' | '中' | '弱' | null }
  > = {};

  for (const ticker of tickers) {
    const event = liveEvents.find((e) => e.primaryTicker === ticker);
    if (event) {
      tickerStatusMap[ticker] = {
        status: event.title.slice(0, 30) + '...',
        importance: event.personalImpact,
      };
    } else {
      tickerStatusMap[ticker] = {
        status: loading ? '読み込み中...' : '新規開示なし',
        importance: null,
      };
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Watchlist Section */}
          <Text style={styles.title}>ウォッチリスト</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="ティッカーを入力"
              placeholderTextColor={COLORS.secondary}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
              accessibilityLabel="Add ticker"
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
          {tickers.map((t) => (
            <View key={t} style={styles.tickerItem}>
              <Text style={styles.tickerText}>{t}</Text>
              <TouchableOpacity
                accessibilityLabel={`Remove ${t}`}
                onPress={() => dispatch(removeTicker(t))}
              >
                <Text style={styles.removeButton}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Live Tiles Section */}
          {tickers.length > 0 && (
            <>
              <Text style={styles.title}>ライブアップデート</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tickers.map((t) => {
                  const data = tickerStatusMap[t] || {
                    status: '読み込み中...',
                    importance: null,
                  };
                  return (
                    <LiveTile
                      key={t}
                      ticker={t}
                      status={data.status}
                      importance={data.importance}
                    />
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Recent Events Section (from mock data) */}
          {allEvents.length > 0 && (
            <>
              <Text style={styles.title}>最新イベント</Text>
              {allEvents.slice(0, 10).map((event) => (
                <TouchableOpacity
                  key={event.clusterId}
                  onPress={() => {
                    dispatch(markEventRead(event.clusterId));
                    setSelectedEvent(event);
                  }}
                >
                  <NotificationLine
                    ticker={event.primaryTicker}
                    company={event.primaryTicker}
                    headline={event.title}
                    importance={event.personalImpact}
                    source={event.sources[0]}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Notifications Section */}
          <Text style={styles.title}>通知履歴</Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>通知はまだありません</Text>
          ) : (
            notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => setSelectedNotification(n)}
              >
                <NotificationLine
                  ticker={n.ticker}
                  company={n.ticker}
                  headline={n.message}
                  importance={n.importance}
                  source="通知"
                />
              </TouchableOpacity>
            ))
          )}

          {/* Settings Section */}
          <Text style={styles.title}>設定</Text>
          <SettingsBlock
            title="高重要度は即時通知"
            value={highImmediate}
            onToggle={(val) => dispatch(setHighImmediate(val))}
          />
          <SettingsBlock
            title="静音モード"
            value={quietMode}
            onToggle={(val) => dispatch(setQuietMode(val))}
          />

          <SettingsBlock
            title="続報のみ受け取る"
            value={followUpsOnly}
            onToggle={(val) => dispatch(setFollowUpsOnly(val))}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Event Sheet for selected event */}
      {selectedEvent && (
        <EventSheet
          summary={
            selectedEvent.summary || selectedEvent.title.slice(0, 150) + '...'
          }
          sources={
            selectedEvent.events.map((e, idx) => ({
              name: e.sourceName,
              url: e.url,
            })) || [{ name: '出典', url: 'https://example.com' }]
          }
          onFollowUpsOnly={() => {
            dispatch(setFollowUpsOnly(true));
            setSelectedEvent(null);
          }}
          onQuiet={() => {
            dispatch(setQuietMode(true));
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Event Sheet for selected notification */}
      {selectedNotification && (
        <EventSheet
          summary={selectedNotification.message}
          sources={[{ name: '出典', url: 'https://example.com' }]}
          onFollowUpsOnly={() => {
            dispatch(setFollowUpsOnly(true));
            setSelectedNotification(null);
          }}
          onQuiet={() => {
            dispatch(setQuietMode(true));
            setSelectedNotification(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <HomeScreen />
    </Provider>
  );
}

const COLORS = {
  accent: '#16a34a',
  background: '#000000',
  border: 'rgba(255,255,255,0.10)',
  card: '#0b0f14',
  secondary: '#6b7280',
  text: '#ffffff',
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: 16,
  },
  /** Text displayed when there are no notifications. */
  emptyText: {
    color: COLORS.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  removeButton: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  tickerItem: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tickerText: {
    color: COLORS.text,
    fontFeatureSettings: '"tnum" 1',
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 16,
  },
});
