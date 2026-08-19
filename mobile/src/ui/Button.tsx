// mobile/src/ui/Button.tsx
import { styled, Button as TamaguiButton, ButtonProps as TamaguiButtonProps } from '@tamagui/core';

export const Button = styled(TamaguiButton, {
  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$primaryText',
        borderRadius: '$md',
        ':hover': { backgroundColor: '$primaryHover' },
        ':active': { backgroundColor: '$primaryPress' },
        ':focus': { boxShadow: '0 0 0 2px $primaryFocus' },
        ':disabled': { backgroundColor: '$primaryDisabled', opacity: 0.6 },
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$secondaryText',
        borderRadius: '$md',
        ':hover': { backgroundColor: '$secondaryHover' },
        ':active': { backgroundColor: '$secondaryPress' },
        ':focus': { boxShadow: '0 0 0 2px $secondaryFocus' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$primary',
        color: '$primary',
        borderRadius: '$md',
        ':hover': { backgroundColor: '$primaryHover', color: '$primaryText' },
        ':active': { backgroundColor: '$primaryPress' },
        ':focus': { boxShadow: '0 0 0 2px $primaryFocus' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$primary',
        borderRadius: '$md',
        ':hover': { backgroundColor: '$backgroundHover' },
        ':active': { backgroundColor: '$backgroundPress' },
        ':focus': { boxShadow: '0 0 0 2px $primaryFocus' },
      },
      danger: {
        backgroundColor: '$error',
        color: '$errorText',
        borderRadius: '$md',
        ':hover': { backgroundColor: '$errorHover' },
        ':active': { backgroundColor: '$errorPress' },
        ':focus': { boxShadow: '0 0 0 2px $errorFocus' },
      },
    },
    size: {
      sm: { height: 36, paddingHorizontal: '$4', fontSize: '$2', borderRadius: '$sm' },
      md: { height: 48, paddingHorizontal: '$6', fontSize: '$3', borderRadius: '$md' },
      lg: { height: 56, paddingHorizontal: '$8', fontSize: '$4', borderRadius: '$lg' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    loading: {
      true: { opacity: 0.7 },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
}) as typeof TamaguiButton;

export type ButtonProps = TamaguiButtonProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
};