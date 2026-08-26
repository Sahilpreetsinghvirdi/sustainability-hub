// mobile/src/components/common/Modal.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal as RNModal, ViewStyle, Animated, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows, animation, typography } from '@/constants/theme';


export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayPress?: boolean;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayPress = true,
  showCloseButton = true,
  style,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animation.duration.fast,
          easing: animation.easing.easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animation.duration.normal,
          easing: animation.easing.easeOut,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animation.duration.fast,
          easing: animation.easing.easeIn,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: animation.duration.fast,
          easing: animation.easing.easeIn,
          useNativeDriver: true,
        }),
      ]).start(() => {});
    }
  }, [visible, fadeAnim, slideAnim]);

  const sizeStyles = {
    sm: { width: '85%', maxWidth: 320 },
    md: { width: '90%', maxWidth: 400 },
    lg: { width: '95%', maxWidth: 500 },
    full: { width: '100%', maxWidth: '100%' },
  };

  if (!visible) return null;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      contentContainerStyle={styles.modalContainer}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
        onStartShouldSetResponder={closeOnOverlayPress ? () => true : () => false}
        onResponderRelease={closeOnOverlayPress ? onClose : undefined}
        pointerEvents={visible ? 'auto' : 'none'}
      />
      <Animated.View
        style={[
          styles.modalWrapper,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.modal, sizeStyles[size], style]}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close modal"
                >
                  <Text style={styles.closeIcon}>\u00D7</Text>
                </Pressable>
              )}
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[950],
    opacity: 0.5,
  },
  modalWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeIcon: {
    fontSize: typography.fontSize.xxl,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.xxl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    maxHeight: '70%',
  },
});