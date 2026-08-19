// mobile/src/ui/Badge.tsx
import { styled, Stack, Text } from '@tamagui/core';

export const Badge = styled(Stack, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  paddingHorizontal: '$3',
  variants: {
    variant: {
      default: { backgroundColor: '$border', color: '$color' },
      success: { backgroundColor: '$successTransparent15', color: '$success' },
      warning: { backgroundColor: '$warningTransparent15', color: '$warning' },
      danger: { backgroundColor: '$errorTransparent15', color: '$error' },
      info: { backgroundColor: '$secondaryTransparent15', color: '$secondary' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '$border', color: '$colorFocus' },
    },
    size: {
      sm: { paddingVertical: 2, minHeight: 20 },
      md: { paddingVertical: 4, minHeight: 24 },
      lg: { paddingVertical: 6, minHeight: 28 },
    },
    dot: {
      true: { flexDirection: 'row', gap: '$1', paddingHorizontal: '$3' },
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
}) as typeof Stack;

export const BadgeDot = styled(Stack, {
  width: 6,
  height: 6,
  borderRadius: '$full',
  backgroundColor: 'currentColor',
}) as typeof Stack;

export const BadgeText = styled(Text, {
  fontWeight: '500',
  variants: {
    size: {
      sm: { fontSize: '$1' },
      md: { fontSize: '$2' },
      lg: { fontSize: '$3' },
    },
    variant: {
      default: { color: '$color' },
      success: { color: '$success' },
      warning: { color: '$warning' },
      danger: { color: '$error' },
      info: { color: '$secondary' },
      outline: { color: '$colorFocus' },
    },
  },
  defaultVariants: { size: 'md', variant: 'default' },
}) as typeof Text;

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}