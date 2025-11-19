import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

import { colors, textStyles, spacing } from '../theme';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Optional loading message */
  message?: string;
  /** Show as fullscreen overlay */
  fullscreen?: boolean;
}

/**
 * Professional loading spinner component
 * Features smooth rotation animation and optional message
 */
const LoadingSpinner = React.memo(
  ({ size = 'medium', message, fullscreen = false }: LoadingSpinnerProps) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Continuous rotation animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

      spinAnimation.start();

      return () => {
        spinAnimation.stop();
      };
    }, [spinValue, fadeAnim]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const spinnerSize = {
      small: 24,
      medium: 40,
      large: 64,
    }[size];

    const containerStyle = fullscreen
      ? styles.fullscreenContainer
      : styles.inlineContainer;

    return (
      <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.spinner,
              {
                width: spinnerSize,
                height: spinnerSize,
                borderRadius: spinnerSize / 2,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View
              style={[
                styles.spinnerSegment,
                {
                  width: spinnerSize,
                  height: spinnerSize,
                  borderRadius: spinnerSize / 2,
                  borderWidth: Math.max(2, spinnerSize / 10),
                },
              ]}
            />
          </Animated.View>

          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </Animated.View>
    );
  },
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerSegment: {
    borderColor: colors.border,
    borderTopColor: colors.accent,
    borderRightColor: colors.accentLight,
  },
  message: {
    ...textStyles.body,
    color: colors.text,
    marginTop: spacing[4],
    textAlign: 'center',
  },
});
