// mobile/src/ui/Button.tsx
import { styled, Button } from 'tamagui';

export const StyledButton = styled(Button, {
  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$primaryText',
        borderRadius: '$md',
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$secondaryText',
        borderRadius: '$md',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$primary',
        color: '$primary',
        borderRadius: '$md',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$primary',
        borderRadius: '$md',
      },
      danger: {
        backgroundColor: '$error',
        color: '$errorText',
        borderRadius: '$md',
      },
    },
    size: {
      sm: { height: 36, paddingHorizontal: 16, fontSize: 14 },
      md: { height: 48, paddingHorizontal: 24, fontSize: 16 },
      lg: { height: 56, paddingHorizontal: 32, fontSize: 18 },
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
});
