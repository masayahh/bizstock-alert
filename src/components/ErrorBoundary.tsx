import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius, shadows } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  fadeAnim: Animated.Value;
}

/**
 * ErrorBoundary component to catch and display errors gracefully
 * Provides professional error UI with retry functionality
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fadeAnim: new Animated.Value(0),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Fade in error UI
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  handleReset = () => {
    // Fade out before reset
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        fadeAnim: new Animated.Value(0),
      });
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Animated.View
          style={[styles.container, { opacity: this.state.fadeAnim }]}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>予期しないエラーが発生しました</Text>
            <Text style={styles.subtitle}>
              アプリの実行中にエラーが発生しました
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>エラー詳細:</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="再試行"
              accessibilityHint="アプリを再起動します"
            >
              <Text style={styles.buttonText}>🔄 再試行</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  errorDetails: {
    width: '100%',
    backgroundColor: colors.errorBg,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    ...textStyles.label,
    color: colors.error,
    marginBottom: spacing[2],
  },
  errorMessage: {
    ...textStyles.bodySmall,
    color: colors.error,
    marginBottom: spacing[2],
    fontFamily: 'monospace',
  },
  errorStack: {
    ...textStyles.caption,
    color: colors.error,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  buttonText: {
    ...textStyles.button,
    color: colors.text,
  },
});

export default ErrorBoundary;
