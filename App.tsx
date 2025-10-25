import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Provider } from 'react-redux';

import DebugScreen from './src/DebugScreen';
import ErrorBoundary from './src/ErrorBoundary';
import EventSheet from './src/EventSheet';
import LiveTile from './src/LiveTile';
import NotificationLine from './src/NotificationLine';
import SettingsBlock from './src/SettingsBlock';
import { useAppInit } from './src/hooks/useAppInit';
import { useAppDispatch, useAppSelector } from './src/hooks/useRedux';
import store from './src/store';
import { markEventRead } from './src/store/eventsSlice';
import { Notification } from './src/store/notificationsSlice';
import {
  selectAllEvents,
  selectEventsError,
  selectIsInitialLoading,
  selectNotifications,
  selectSettings,
  selectTickerStatusMap,
  selectWatchlistTickers,
} from './src/store/selectors';
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

  // Access Redux state with memoized selectors
  const tickers = useAppSelector(selectWatchlistTickers);
  const notifications = useAppSelector(selectNotifications);
  const allEvents = useAppSelector(selectAllEvents);
  const tickerStatusMap = useAppSelector(selectTickerStatusMap);
  const loading = useAppSelector(selectIsInitialLoading);
  const error = useAppSelector(selectEventsError);
  const settings = useAppSelector(selectSettings);

  const dispatch = useAppDispatch();
  const [input, setInput] = useState('');

  // Currently selected event for displaying an EventSheet overlay
  const [selectedEvent, setSelectedEvent] = useState<PersonalizedEvent | null>(
    null,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Debug screen visibility (long-press on title to open)
  const [debugVisible, setDebugVisible] = useState(false);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      dispatch(addTicker(trimmed.toUpperCase()));
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Watchlist Section */}
        <TouchableOpacity
          onLongPress={() => setDebugVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>ウォッチリスト</Text>
        </TouchableOpacity>
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
            <View style={styles.liveTilesContainer}>
              {tickers.slice(0, 3).map((t) => {
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
            </View>
          </>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && tickers.length > 0 && allEvents.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>データを取得中...</Text>
          </View>
        )}

        {/* Recent Events Section (from mock data) */}
        {allEvents.length > 0 && (
          <>
            <Text style={styles.title}>最新イベント</Text>
            {allEvents.slice(0, 5).map((event) => (
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
          notifications.slice(0, 5).map((n) => (
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
          value={settings.highImmediate}
          onToggle={(val) => dispatch(setHighImmediate(val))}
        />
        <SettingsBlock
          title="静音モード"
          value={settings.quietMode}
          onToggle={(val) => dispatch(setQuietMode(val))}
        />

        <SettingsBlock
          title="続報のみ受け取る"
          value={settings.followUpsOnly}
          onToggle={(val) => dispatch(setFollowUpsOnly(val))}
        />
      </ScrollView>

      {/* Event Sheet for selected event */}
      <EventSheet
        visible={!!selectedEvent}
        summary={
          selectedEvent
            ? selectedEvent.summary || selectedEvent.title.slice(0, 150) + '...'
            : ''
        }
        sources={
          selectedEvent
            ? selectedEvent.events.map((e) => ({
                name: e.sourceName,
                url: e.url,
              }))
            : []
        }
        onClose={() => setSelectedEvent(null)}
        onFollowUpsOnly={() => {
          dispatch(setFollowUpsOnly(true));
          setSelectedEvent(null);
        }}
        onQuiet={() => {
          dispatch(setQuietMode(true));
          setSelectedEvent(null);
        }}
      />

      {/* Event Sheet for selected notification */}
      <EventSheet
        visible={!!selectedNotification}
        summary={selectedNotification?.message || ''}
        sources={[{ name: '出典', url: 'https://example.com' }]}
        onClose={() => setSelectedNotification(null)}
        onFollowUpsOnly={() => {
          dispatch(setFollowUpsOnly(true));
          setSelectedNotification(null);
        }}
        onQuiet={() => {
          dispatch(setQuietMode(true));
          setSelectedNotification(null);
        }}
      />

      {/* Debug Screen (long-press title to open) */}
      <DebugScreen
        visible={debugVisible}
        onClose={() => setDebugVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <HomeScreen />
      </ErrorBoundary>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  /** Text displayed when there are no notifications. */
  emptyText: {
    color: COLORS.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: '#dc2626',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 8,
    padding: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  liveTilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
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
