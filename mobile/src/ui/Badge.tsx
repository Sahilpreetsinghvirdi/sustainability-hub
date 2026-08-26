import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'primary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  style?: any;
  [key: string]: any;
}

const palette: Record<string, { bg: string; text: string }> = {
  default: { bg: colors.background.tertiary, text: colors.text.secondary },
  success: { bg: 'rgba(10,10,10,0.1)', text: colors.primary[300] },
  warning: { bg: 'rgba(10,10,10,0.08)', text: colors.warning },
  error: { bg: 'rgba(10,10,10,0.08)', text: colors.error },
  danger: { bg: 'rgba(10,10,10,0.08)', text: colors.error },
  info: { bg: 'rgba(10,10,10,0.08)', text: colors.info },
  outline: { bg: 'transparent', text: colors.text.secondary },
  primary: { bg: 'rgba(10,10,10,0.1)', text: colors.primary[300] },
};

const sizes = {
  xs: { px: 6, py: 2, fs: 10 },
  sm: { px: 9, py: 4, fs: 11 },
  md: { px: 10, py: 5, fs: 12 },
  lg: { px: 12, py: 6, fs: 14 },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', style }) => {
  const paletteItem = palette[variant] || palette.default;
  const sizeItem = sizes[size] || sizes.md;
  return <View style={[styles.badge, { backgroundColor: paletteItem.bg, paddingHorizontal: sizeItem.px, paddingVertical: sizeItem.py }, variant === 'outline' && styles.outline, style]}><Text style={[styles.text, { color: paletteItem.text, fontSize: sizeItem.fs }]}>{children}</Text></View>;
};

const styles = StyleSheet.create({
  badge: { borderRadius: borderRadius.full, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  outline: { borderWidth: 1, borderColor: colors.border.medium },
  text: { fontWeight: typography.fontWeight.bold },
});
