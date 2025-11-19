import React, { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius, shadows } from '../theme';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';
export type ModalPosition = 'center' | 'bottom';

export interface ModalProps {
  /** Modal visibility */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Modal position */
  position?: ModalPosition;
  /** Show close button */
  showCloseButton?: boolean;
  /** Disable backdrop press to close */
  disableBackdropPress?: boolean;
  /** Footer content */
  footer?: React.ReactNode;
}

/**
 * Professional modal component with multiple sizes and positions
 * Supports center and bottom sheet presentations
 */
const Modal = React.memo(
  ({
    visible,
    onClose,
    title,
    children,
    size = 'medium',
    position = 'center',
    showCloseButton = true,
    disableBackdropPress = false,
    footer,
  }: ModalProps) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(0));

    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 1,
            friction: 9,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, fadeAnim, slideAnim]);

    const handleBackdropPress = () => {
      if (!disableBackdropPress) {
        onClose();
      }
    };

    const getModalWidth = () => {
      switch (size) {
        case 'small':
          return Math.min(320, screenWidth * 0.9);
        case 'medium':
          return Math.min(480, screenWidth * 0.9);
        case 'large':
          return Math.min(640, screenWidth * 0.9);
        case 'full':
          return screenWidth;
      }
    };

    const getModalHeight = () => {
      if (size === 'full') return screenHeight;
      if (position === 'bottom') return screenHeight * 0.85;
      return undefined; // Auto height for center modals
    };

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange:
        position === 'bottom' ? [screenHeight, 0] : [screenHeight / 10, 0],
    });

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdropTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Modal Content */}
        <View
          style={[
            styles.container,
            position === 'bottom' && styles.containerBottom,
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.modal,
              position === 'bottom' && styles.modalBottom,
              {
                width: getModalWidth(),
                maxHeight: getModalHeight(),
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Handle bar for bottom sheets */}
            {position === 'bottom' && (
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityRole="button"
                    accessibilityLabel="モーダルを閉じる"
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </Animated.View>
        </View>
      </RNModal>
    );
  },
);

Modal.displayName = 'Modal';

export default Modal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  containerBottom: {
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  modal: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
    overflow: 'hidden',
  },
  modalBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textSecondary,
    borderRadius: borderRadius.full,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: spacing[2],
  },
  closeText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '300',
  },
  content: {
    padding: spacing[5],
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
