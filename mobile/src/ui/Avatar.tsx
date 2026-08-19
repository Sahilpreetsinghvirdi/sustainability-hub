// mobile/src/ui/Avatar.tsx
import { styled, Stack, Text, Image } from '@tamagui/core';

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 } as const;
const fontSizeMap = { xs: 10, sm: 12, md: 14, lg: 20, xl: 28 } as const;

export const Avatar = styled(Stack, {
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  variants: {
    size: {
      xs: { width: 24, height: 24 },
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 56, height: 56 },
      xl: { width: 80, height: 80 },
    },
    shape: { circle: { borderRadius: '$full' }, square: { borderRadius: '$md' } },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
}) as typeof Stack;

export const AvatarImage = styled(Image, {
  variants: {
    size: {
      xs: { width: 24, height: 24 },
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 56, height: 56 },
      xl: { width: 80, height: 80 },
    },
    shape: { circle: { borderRadius: '$full' }, square: { borderRadius: '$md' } },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
}) as typeof Image;

export const AvatarInitials = styled(Text, {
  fontWeight: '600',
  color: '$colorInverted',
  variants: {
    size: { xs: { fontSize: 10 }, sm: { fontSize: 12 }, md: { fontSize: 14 }, lg: { fontSize: 20 }, xl: { fontSize: 28 } },
  },
}) as typeof Text;

export const AvatarStatus = styled(Stack, {
  position: 'absolute',
  bottom: 0,
  right: 0,
  borderRadius: '$full',
  borderWidth: 2,
  padding: 1,
  variants: {
    size: { xs: { width: 8, height: 8 }, sm: { width: 10, height: 10 }, md: { width: 12, height: 12 }, lg: { width: 16, height: 16 }, xl: { width: 20, height: 20 } },
    status: { online: { backgroundColor: '$success' }, busy: { backgroundColor: '$error' }, away: { backgroundColor: '$warning' }, offline: { backgroundColor: '$colorDisabled' } },
  },
}) as typeof Stack;

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
}