// mobile/src/ui/Modal.tsx
import { styled, Stack, Text, Pressable, Animated, StackProps, TextProps } from '@tamagui/core';
import { Portal } from 'react-native-portal';

export const ModalOverlay = styled(Animated.View, {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: '$background',
  opacity: 0.5,
}) as typeof Animated.View;

export const ModalWrapper = styled(Animated.View, {
  width: '100%',
  alignItems: 'center',
}) as typeof Animated.View;

export const ModalContainer = styled(Stack, {
  backgroundColor: '$backgroundStrong',
  borderRadius: '$xl',
  overflow: 'hidden',
  elevation: 8,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.3,
  shadowRadius: 24,
  maxHeight: '90%',
  variants: {
    size: {
      sm: { width: '85%', maxWidth: 320 },
      md: { width: '90%', maxWidth: 400 },
      lg: { width: '95%', maxWidth: 500 },
      full: { width: '100%', maxWidth: '100%' },
    },
  },
  defaultVariants: { size: 'md' },
}) as typeof Stack;

export const ModalHeader = styled(Stack, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$6',
  paddingVertical: '$4',
  borderBottomWidth: 1,
  borderBottomColor: '$border',
}) as typeof Stack;

export const ModalTitle = styled(Text, {
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
}) as typeof Text;

export const ModalClose = styled(Pressable, {
  padding: '$1',
  hitSlop: 8,
}) as typeof Pressable;

export const ModalCloseIcon = styled(Text, {
  fontSize: '$7',
  color: '$colorFocus',
  lineHeight: 32,
}) as typeof Text;

export const ModalContent = styled(Stack, {
  paddingHorizontal: '$6',
  paddingVertical: '$6',
  maxHeight: '70%',
}) as typeof Stack;

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayPress?: boolean;
  showCloseButton?: boolean;
}