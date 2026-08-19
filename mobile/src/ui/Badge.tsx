import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'primary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  style?: any;
  [key: string]: any;
}

const colors: Record<string, { bg: string; text: string }> = {
  default: { bg: '#334155', text: '#CBD5E1' },
  success: { bg: 'rgba(34,197,94,0.2)', text: '#34D399' },
  warning: { bg: 'rgba(245,158,11,0.2)', text: '#FBBF24' },
  error: { bg: 'rgba(239,68,68,0.2)', text: '#F87171' },
  danger: { bg: 'rgba(239,68,68,0.2)', text: '#F87171' },
  info: { bg: 'rgba(59,130,246,0.2)', text: '#60A5FA' },
  outline: { bg: 'transparent', text: '#CBD5E1' },
  primary: { bg: 'rgba(34,197,94,0.2)', text: '#34D399' },
};

const sizes = {
  xs: { px: 6, py: 2, fs: 10 },
  sm: { px: 10, py: 4, fs: 12 },
  md: { px: 10, py: 4, fs: 12 },
  lg: { px: 12, py: 6, fs: 14 },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', style, ...rest }) => {
  const c = colors[variant] || colors.default;
  const s = sizes[size] || sizes.md;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, paddingHorizontal: s.px, paddingVertical: s.py }, variant === 'outline' && styles.outline, style]}>
      <Text style={[styles.text, { color: c.text, fontSize: s.fs }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: 12, alignSelf: 'flex-start' },
  outline: { borderWidth: 1, borderColor: '#475569' },
  text: { fontWeight: '600' },
});
