// mobile/src/ui/Badge.tsx
import React from 'react';
import { Stack, Text } from 'tamagui';

export type BadgeProps = {
  children?: React.ReactNode;
  variant?: string;
  size?: string;
  dot?: boolean;
  style?: any;
};

const badgeColors: Record<string, { bg: string; text: string }> = {
  default: { bg: '#334155', text: '#94A3B8' },
  success: { bg: '#065F46', text: '#34D399' },
  warning: { bg: '#78350F', text: '#FBBF24' },
  error: { bg: '#7F1D1D', text: '#FCA5A5' },
  info: { bg: '#1E3A5F', text: '#60A5FA' },
  outline: { bg: 'transparent', text: '#94A3B8' },
};

export function Badge({ children, variant = 'default', size = 'sm', dot, style }: BadgeProps) {
  const c = badgeColors[variant] || badgeColors.default;
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 2 : 4;
  return (
    <Stack
      backgroundColor={c.bg}
      borderRadius={6}
      paddingHorizontal={px}
      paddingVertical={py}
      flexDirection="row"
      alignItems="center"
      gap={4}
      style={style}
    >
      {dot && <Stack width={6} height={6} borderRadius={3} backgroundColor={c.text} />}
      <Text color={c.text} fontSize={size === 'sm' ? 11 : 13} fontWeight="600">{children as string}</Text>
    </Stack>
  );
}
