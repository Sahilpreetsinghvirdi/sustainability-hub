import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  status?: 'online' | 'busy' | 'away' | 'offline';
  style?: any;
}

const statusColors: Record<string, string> = {
  online: '#22C55E',
  busy: '#EF4444',
  away: '#F59E0B',
  offline: '#64748B',
};

const getColor = (name: string) => {
  const colors = ['#22C55E', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ name, size = 40, status, style }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, style]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: getColor(name) }]}>
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
      </View>
      {status && (
        <View style={[styles.dot, { backgroundColor: statusColors[status], width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, borderWidth: size * 0.05 }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '700' },
  dot: { position: 'absolute', bottom: 0, right: 0, borderColor: '#0A1628' },
});
