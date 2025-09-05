import React from 'react';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import store from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Text style={styles.title}>BizStock Alert</Text>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});