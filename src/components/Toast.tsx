import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius, shadows } from '../theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Toast position */
  position?: ToastPosition;
  /** Duration in milliseconds (0 = manual dismiss) */
  duration?: number;
  /** Show toast */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Professional toast notification component
 * Slides in from top/bottom with auto-dismiss
 */
const Toast = React.memo(
  ({
    message,
    type = 'info',
    position = 'top',
    duration = 3000,
    visible,
    onClose,
    action,
  }: ToastProps) => {
    const [slideAnim] = useState(new Animated.Value(0));
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
      if (visible) {
        // Slide in
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Auto-dismiss after duration
        if (duration > 0) {
          const timer = setTimeout(() => {
            handleClose();
          }, duration);
          return () => clearTimeout(timer);
        }
      } else {
        // Slide out
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }, [visible, duration, slideAnim]);

    const handleClose = () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    };

    if (!visible) return null;

    // Get toast styles based on type
    const getToastStyles = () => {
      switch (type) {
        case 'success':
          return {
            backgroundColor: colors.success,
            icon: '✓',
          };
        case 'error':
          return {
            backgroundColor: colors.error,
            icon: '✕',
          };
        case 'warning':
          return {
            backgroundColor: colors.warning,
            icon: '⚠',
          };
        case 'info':
          return {
            backgroundColor: colors.info,
            icon: 'ℹ',
          };
      }
    };

    const toastStyles = getToastStyles();

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: position === 'top' ? [-screenHeight, 0] : [screenHeight, 0],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          position === 'top' ? styles.top : styles.bottom,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View
          style={[
            styles.toast,
            { backgroundColor: toastStyles.backgroundColor },
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>{toastStyles.icon}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.actions}>
            {action && (
              <TouchableOpacity
                onPress={() => {
                  action.onPress();
                  handleClose();
                }}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  },
);

Toast.displayName = 'Toast';

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 10000,
  },
  top: {
    top: spacing[12],
  },
  bottom: {
    bottom: spacing[12],
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    ...shadows.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing[3],
    color: colors.text,
  },
  message: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[3],
  },
  actionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginRight: spacing[2],
  },
  actionText: {
    ...textStyles.label,
    color: colors.text,
    textDecorationLine: 'underline',
  },
  closeButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  closeText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '300',
  },
});
