/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI.
 */

import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  AppError,
  ErrorType,
  logError,
  parseError,
} from './utils/errorHandler';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = parseError(error);
    logError(appError, 'ErrorBoundary');
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>{this.state.error.userMessage}</Text>

          {this.state.error.type === ErrorType.NETWORK && (
            <Text style={styles.hint}>
              • インターネット接続を確認してください{'\n'}•
              Wi-Fiまたはモバイルデータを有効にしてください
            </Text>
          )}

          {this.state.error.type === ErrorType.API && (
            <Text style={styles.hint}>
              • .envファイルのAPIキーを確認してください{'\n'}•
              EXPO_PUBLIC_OPENAI_API_KEYが正しく設定されているか確認してください
            </Text>
          )}

          {this.state.error.type === ErrorType.RATE_LIMIT && (
            <Text style={styles.hint}>
              • API利用制限に達しました{'\n'}•
              しばらく待ってから再試行してください{'\n'}•
              または、モックモードに切り替えてください
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>再試行</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.error.originalError && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>デバッグ情報:</Text>
              <Text style={styles.debugText}>
                {this.state.error.originalError.message}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
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
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  debugInfo: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
    width: '100%',
  },
  debugText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  debugTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  hint: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
    textAlign: 'left',
  },
  message: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
});
