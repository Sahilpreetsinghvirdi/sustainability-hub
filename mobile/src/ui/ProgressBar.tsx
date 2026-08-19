// mobile/src/ui/ProgressBar.tsx
import { styled, Stack, Animated } from '@tamagui/core';

export const ProgressTrack = styled(Stack, {
  backgroundColor: '$background',
  overflow: 'hidden',
  variants: {
    size: {
      sm: { height: 4, borderRadius: '$1' },
      md: { height: 8, borderRadius: '$2' },
      lg: { height: 12, borderRadius: '$3' },
    },
  },
  defaultVariants: { size: 'md' },
}) as typeof Stack;

export const ProgressFill = styled(Animated.View, {
  height: '100%',
  borderRadius: '$inherit',
  variants: {
    variant: {
      default: { backgroundColor: '$primary' },
      success: { backgroundColor: '$success' },
      warning: { backgroundColor: '$warning' },
      danger: { backgroundColor: '$error' },
      gradient: { backgroundColor: '$primary' },
    },
  },
  defaultVariants: { variant: 'default' },
}) as typeof Animated.View;

export const ProgressLabel = styled(Stack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$1',
}) as typeof Stack;

export const ProgressLabelText = styled(Stack, {
  fontSize: '$2',
  fontWeight: '500',
  color: '$color',
}) as typeof Stack;

export const ProgressLabelValue = styled(Stack, {
  fontSize: '$2',
  fontWeight: '600',
  color: '$colorFocus',
}) as typeof Stack;