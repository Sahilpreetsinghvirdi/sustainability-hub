import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  status?: 'online' | 'busy' | 'away' | 'offline';
  style?: any;
}

const statusColors: Record<string, string> = { online: colors.primary[400], busy: colors.error, away: colors.warning, offline: colors.text.tertiary };
const avatarColors = [colors.primary[700], colors.secondary[700], '#444444', '#6B6B6B', '#444444', '#444444'];

const getColor = (name: string) => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = name.charCodeAt(index) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ name, size = 40, status, style }) => {
  const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, style]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: getColor(name) }]}><Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text></View>
      {status && <View style={[styles.dot, { backgroundColor: statusColors[status], width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, borderWidth: size * 0.05 }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.neutral[0], fontWeight: '700' },
  dot: { position: 'absolute', bottom: 0, right: 0, borderColor: colors.background.primary },
});
