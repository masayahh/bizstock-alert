import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';

import EventSheet from './src/EventSheet';
import LiveTile from './src/LiveTile';
import NotificationLine from './src/NotificationLine';
import SettingsBlock from './src/SettingsBlock';
import store, { RootState } from './src/store';
import { Notification } from './src/store/notificationsSlice';
import {
  setHighImmediate,
  setQuietMode,
  setFollowUpsOnly,
} from './src/store/settingsSlice';
import { addTicker, removeTicker } from './src/store/watchlistSlice';

/**
 * Screen component that allows the user to manage their watchlist of ticker
 * symbols. Users can add tickers via a text input and remove them by tapping
 * the × next to each item. The UI follows the Calm Black design spec with
 * dark backgrounds, subtle borders and an accent color for interactive
 * elements.
 */
function HomeScreen() {
  // Access the watch list from the store. Note that the slice is registered
  // as `watchList` (camelCase L) in the store reducer.
  // Access the watchlist slice as defined in src/store/index.ts. The slice is
  // registered under the key `watchlist` in the store reducer. Using the
  // incorrect key (e.g. watchList) would result in `undefined` access.
  const tickers = useSelector((state: RootState) => state.watchlist.tickers);
  const notifications = useSelector(
    (state: RootState) => state.notifications.items,
  );
  const highImmediate = useSelector(
    (state: RootState) => state.settings.highImmediate,
  );
  const quietMode = useSelector((state: RootState) => state.settings.quietMode);
  const followUpsOnly = useSelector(
    (state: RootState) => state.settings.followUpsOnly,
  );
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  // Hold event status for each ticker (aligned with product spec: no price display)
  const [tickerStatus, setTickerStatus] = useState<{
    [ticker: string]: { status: string; importance: '強' | '中' | '弱' | null };
  }>({});
  // Currently selected notification for displaying an EventSheet overlay
  const [selected, setSelected] = useState<Notification | null>(null);

  // Whenever the watchlist changes, initialize status for each ticker
  // In production, this would fetch latest IR/PR/EDINET events via backend API
  useEffect(() => {
    const newStatus: {
      [ticker: string]: {
        status: string;
        importance: '強' | '中' | '弱' | null;
      };
    } = {};
    for (const t of tickers) {
      // Placeholder: In production, fetch real event data from backend
      newStatus[t] = {
        status: '新規開示なし（デモ）',
        importance: null,
      };
    }
    setTickerStatus(newStatus);
  }, [tickers]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      dispatch(addTicker(trimmed.toUpperCase()));
      setInput('');
    }
  };

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
                  const data = tickerStatus[t] || {
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

          {/* Notifications Section */}
          <Text style={styles.title}>通知履歴</Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>通知はまだありません</Text>
          ) : (
            notifications.map((n) => (
              <TouchableOpacity key={n.id} onPress={() => setSelected(n)}>
                <NotificationLine
                  ticker={n.ticker}
                  company={n.ticker}
                  headline={n.message}
                  importance={n.importance}
                  source="デモ"
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
      {selected && (
        <EventSheet
          summary={selected.message}
          sources={[{ name: '出典', url: 'https://example.com' }]}
          onFollowUpsOnly={() => {
            dispatch(setFollowUpsOnly(true));
            setSelected(null);
          }}
          onQuiet={() => {
            dispatch(setQuietMode(true));
            setSelected(null);
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
  background: '#000000',
  card: '#0b0f14',
  accent: '#16a34a',
  text: '#ffffff',
  secondary: '#6b7280',
  border: 'rgba(255,255,255,0.10)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  addButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 14,
  },
  tickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tickerText: {
    color: COLORS.text,
    fontSize: 16,
    fontFeatureSettings: '"tnum" 1',
  },
  removeButton: {
    color: COLORS.accent,
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
  },
  /** Text displayed when there are no notifications. */
  emptyText: {
    color: COLORS.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
});
