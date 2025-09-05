import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import store, { RootState } from './src/store';
import { addTicker, removeTicker } from './src/store/watchlistSlice';

/**
 * Screen component that allows the user to manage their watchlist of ticker
 * symbols. Users can add tickers via a text input and remove them by tapping
 * the × next to each item. The UI follows the Calm Black design spec with
 * dark backgrounds, subtle borders and an accent color for interactive
 * elements.
 */
function WatchlistScreen() {
  const tickers = useSelector((state: RootState) => state.watchlist.tickers);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      dispatch(addTicker(trimmed.toUpperCase()));
      setInput('');
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.tickerItem}>
      <Text style={styles.tickerText}>{item}</Text>
      <TouchableOpacity
        accessibilityLabel={`Remove ${item}`}
        onPress={() => dispatch(removeTicker(item))}
      >
        <Text style={styles.removeButton}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
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
        <FlatList
          data={tickers}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <WatchlistScreen />
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
});