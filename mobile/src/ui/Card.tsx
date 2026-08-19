// mobile/src/ui/Card.tsx
import { styled, Stack, StackProps } from '@tamagui/core';

export const Card = styled(Stack, {
  backgroundColor: '$backgroundStrong',
  borderRadius: '$lg',
  borderWidth: 1,
  borderColor: '$border',
  variants: {
    variant: {
      default: { backgroundColor: '$backgroundStrong', borderWidth: 1, borderColor: '$border' },
      elevated: { backgroundColor: '$backgroundStrong', elevation: 4, shadowColor: '$shadowColor', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      outlined: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '$borderHover' },
      filled: { backgroundColor: '$backgroundHover', borderWidth: 0 },
    },
    padding: {
      none: { padding: 0 },
      sm: { padding: '$3' },
      md: { padding: '$4' },
      lg: { padding: '$6' },
    },
    hoverable: {
      true: {
        ':hover': { backgroundColor: '$backgroundPress', borderColor: '$borderHover' },
        ':active': { backgroundColor: '$backgroundPress' },
      },
    },
  },
  defaultVariants: { variant: 'default', padding: 'md' },
}) as typeof Stack;

export interface CardProps extends StackProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const CardHeader = styled(Stack, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '$3',
  marginBottom: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$border',
}) as typeof Stack;

export const CardTitle = styled(Stack, {
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
}) as typeof Stack;

export const CardSubtitle = styled(Stack, {
  fontSize: '$2',
  color: '$colorFocus',
  marginTop: '$1',
}) as typeof Stack;