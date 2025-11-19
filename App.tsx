import React, { useState, useMemo, useCallback } from 'react';
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
  RefreshControl,
  Animated,
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

type FilterType = 'all' | 'high' | 'medium' | 'low';
type SortType = 'time' | 'importance';

/**
 * Enhanced HomeScreen with professional UI, search, filter, and sort capabilities.
 *
 * Features:
 * - Real-time search across events and notifications
 * - Filter by importance level (high/medium/low)
 * - Sort by time or importance
 * - Pull-to-refresh
 * - Smooth animations
 * - Professional design with gradients and shadows
 * - Full accessibility support
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

  // Local state
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('time');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PersonalizedEvent | null>(
    null,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [debugVisible, setDebugVisible] = useState(false);

  // Animation value
  const [fadeAnim] = useState(new Animated.Value(0));

  // Fade in on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle ticker add with validation
  const handleAdd = useCallback(() => {
    const trimmed = input.trim().toUpperCase();
    if (trimmed && /^[A-Z0-9]{1,10}$/.test(trimmed)) {
      dispatch(addTicker(trimmed));
      setInput('');
    }
  }, [input, dispatch]);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.primaryTicker.toLowerCase().includes(query) ||
          event.summary?.toLowerCase().includes(query),
      );
    }

    // Apply importance filter
    if (filter !== 'all') {
      filtered = filtered.filter((event) => {
        if (filter === 'high') return event.personalImpact === '強';
        if (filter === 'medium') return event.personalImpact === '中';
        if (filter === 'low') return event.personalImpact === '弱';
        return true;
      });
    }

    // Apply sorting
    if (sortBy === 'importance') {
      const importanceOrder = { 強: 3, 中: 2, 弱: 1 };
      filtered = [...filtered].sort((a, b) => {
        const aValue = importanceOrder[a.personalImpact] || 0;
        const bValue = importanceOrder[b.personalImpact] || 0;
        return bValue - aValue;
      });
    }

    return filtered.slice(0, 10); // Show max 10 events
  }, [allEvents, searchQuery, filter, sortBy]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.message.toLowerCase().includes(query) ||
          notif.ticker.toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter((notif) => {
        if (filter === 'high') return notif.importance === '強';
        if (filter === 'medium') return notif.importance === '中';
        if (filter === 'low') return notif.importance === '弱';
        return true;
      });
    }

    return filtered.slice(0, 10);
  }, [notifications, searchQuery, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
        >
          {/* Header Section */}
          <TouchableOpacity
            onLongPress={() => setDebugVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="header"
            accessibilityLabel="ウォッチリスト - 長押しでデバッグ画面"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>BizStock Alert</Text>
              <Text style={styles.headerSubtitle}>リアルタイムIR通知</Text>
            </View>
          </TouchableOpacity>

          {/* Search Bar */}
          {(allEvents.length > 0 || notifications.length > 0) && (
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="イベント・通知を検索..."
                placeholderTextColor={COLORS.secondaryLight}
                accessibilityLabel="検索入力"
                accessibilityHint="イベントや通知を検索できます"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  accessibilityLabel="検索をクリア"
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Filter and Sort Controls */}
          {(allEvents.length > 0 || notifications.length > 0) && (
            <View style={styles.controlsContainer}>
              <View style={styles.filterContainer}>
                <Text style={styles.controlLabel}>フィルタ:</Text>
                {(['all', 'high', 'medium', 'low'] as FilterType[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.filterButton,
                      filter === f && styles.filterButtonActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${
                      f === 'all'
                        ? '全て'
                        : f === 'high'
                          ? '高重要度'
                          : f === 'medium'
                            ? '中重要度'
                            : '低重要度'
                    }でフィルタ`}
                    accessibilityState={{ selected: filter === f }}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filter === f && styles.filterButtonTextActive,
                      ]}
                    >
                      {f === 'all'
                        ? '全て'
                        : f === 'high'
                          ? '高'
                          : f === 'medium'
                            ? '中'
                            : '低'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sortContainer}>
                <Text style={styles.controlLabel}>並び:</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSortBy(sortBy === 'time' ? 'importance' : 'time')
                  }
                  style={styles.sortButton}
                  accessibilityRole="button"
                  accessibilityLabel={`並び順を${sortBy === 'time' ? '重要度順' : '時刻順'}に変更`}
                >
                  <Text style={styles.sortButtonText}>
                    {sortBy === 'time' ? '📅 時刻' : '⭐ 重要度'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Watchlist Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ウォッチリスト</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="ティッカーを入力 (例: 7203)"
                placeholderTextColor={COLORS.secondaryLight}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleAdd}
                accessibilityLabel="ティッカー入力"
                accessibilityHint="追加したいティッカーシンボルを入力してください"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !input.trim() && styles.addButtonDisabled,
                ]}
                onPress={handleAdd}
                disabled={!input.trim()}
                accessibilityRole="button"
                accessibilityLabel="ティッカーを追加"
                accessibilityState={{ disabled: !input.trim() }}
              >
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            </View>

            {tickers.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📊</Text>
                <Text style={styles.emptyStateText}>
                  ウォッチリストにティッカーを追加して開始
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  例: 7203, 6758, 9984
                </Text>
              </View>
            )}

            {tickers.map((t) => (
              <View key={t} style={styles.tickerItem}>
                <Text style={styles.tickerText}>{t}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`${t}を削除`}
                  onPress={() => dispatch(removeTicker(t))}
                  style={styles.removeButtonContainer}
                >
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Live Tiles Section */}
          {tickers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ライブアップデート</Text>
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
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer} role="alert">
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading Indicator */}
          {loading && tickers.length > 0 && allEvents.length === 0 && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <Text style={styles.loadingText}>📡</Text>
              </View>
              <Text style={styles.loadingLabel}>データを取得中...</Text>
            </View>
          )}

          {/* Recent Events Section */}
          {filteredEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最新イベント</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{filteredEvents.length}</Text>
                </View>
              </View>
              {filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.clusterId}
                  onPress={() => {
                    dispatch(markEventRead(event.clusterId));
                    setSelectedEvent(event);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`イベント: ${event.title}`}
                  accessibilityHint="タップして詳細を表示"
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
            </View>
          )}

          {/* No Results Message */}
          {searchQuery.trim() &&
            filteredEvents.length === 0 &&
            allEvents.length > 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsText}>
                  「{searchQuery}」に一致する結果が見つかりません
                </Text>
              </View>
            )}

          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>通知履歴</Text>
              {filteredNotifications.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {filteredNotifications.length}
                  </Text>
                </View>
              )}
            </View>
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔔</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery.trim()
                    ? '検索条件に一致する通知がありません'
                    : '通知はまだありません'}
                </Text>
              </View>
            ) : (
              filteredNotifications.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => setSelectedNotification(n)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`通知: ${n.message}`}
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
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>設定</Text>
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
          </View>
        </ScrollView>
      </Animated.View>

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

// Professional Color Palette
const COLORS = {
  // Primary colors
  accent: '#10b981', // Emerald green - more vibrant
  accentLight: '#34d399',
  accentDark: '#059669',

  // Background colors with depth
  background: '#000000',
  backgroundElevated: '#0a0f14',
  backgroundCard: '#111827',

  // Text colors
  text: '#ffffff',
  textSecondary: '#9ca3af',
  secondaryLight: '#6b7280',

  // Border colors
  border: 'rgba(255,255,255,0.08)',
  borderFocus: 'rgba(16, 185, 129, 0.3)',

  // Status colors
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  success: '#10b981',

  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
  },

  // Header Styles
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Search Styles
  searchContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },

  // Controls (Filter & Sort)
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  sortContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  controlLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  sortButton: {
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Input Styles
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.backgroundCard,
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Ticker Item Styles
  tickerItem: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tickerText: {
    color: COLORS.text,
    fontFeatureSettings: '"tnum" 1',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  removeButtonContainer: {
    padding: 4,
  },
  removeButton: {
    color: COLORS.error,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Live Tiles Container
  liveTilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 12,
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: COLORS.secondaryLight,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  // No Results
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  noResultsText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },

  // Error Container
  errorContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.error,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    color: COLORS.error,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Loading Container
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 32,
  },
  loadingLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
