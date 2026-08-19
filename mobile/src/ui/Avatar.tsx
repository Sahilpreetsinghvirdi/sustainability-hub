// mobile/src/ui/Avatar.tsx
import React from 'react';
import { Stack, Text } from 'tamagui';
import { Image } from 'react-native';

export type AvatarProps = {
  src?: string;
  name?: string;
  source?: { uri: string };
  size?: number | string;
  status?: string;
  style?: any;
};

const sizeMap: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };

export function Avatar({ src, name, source, size = 40, status, style }: AvatarProps) {
  const s = typeof size === 'string' ? (sizeMap[size] || 40) : size;
  const uri = src || source?.uri;
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const statusColors: Record<string, string> = { online: '#22C55E', busy: '#EF4444', away: '#F59E0B', offline: '#64748B' };

  return (
    <Stack style={[{ width: s, height: s, borderRadius: s / 2 }, style]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: s, height: s, borderRadius: s / 2 }} />
      ) : (
        <Stack width={s} height={s} borderRadius={s / 2} backgroundColor="#2563EB" alignItems="center" justifyContent="center">
          <Text color="#FFFFFF" fontWeight="600" fontSize={s * 0.4}>{initials}</Text>
        </Stack>
      )}
      {status && (
        <Stack
          position="absolute"
          bottom={0}
          right={0}
          width={s * 0.25}
          height={s * 0.25}
          borderRadius={s * 0.125}
          backgroundColor={statusColors[status] || '#64748B'}
          borderWidth={2}
          borderColor="#1E293B"
        />
      )}
    </Stack>
  );
}
