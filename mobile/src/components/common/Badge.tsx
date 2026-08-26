import React from 'react';
import { Text, TextStyle, View, ViewStyle, StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export interface BadgeProps { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'; size?: 'sm' | 'md' | 'lg'; dot?: boolean; style?: ViewStyle; textStyle?: TextStyle }

const palette: Record<string, { background: string; text: string }> = {
  default: { background: colors.background.tertiary, text: colors.text.secondary },
  success: { background: 'rgba(10,10,10,0.1)', text: colors.primary[300] },
  warning: { background: 'rgba(10,10,10,0.08)', text: colors.warning },
  danger: { background: 'rgba(10,10,10,0.08)', text: colors.error },
  info: { background: 'rgba(10,10,10,0.08)', text: colors.info },
  outline: { background: 'transparent', text: colors.text.secondary },
};

const sizes = { sm: { vertical: 2, fontSize: typography.fontSize.xs }, md: { vertical: 4, fontSize: typography.fontSize.sm }, lg: { vertical: 6, fontSize: typography.fontSize.md } };

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', dot = false, style, textStyle }) => {
  const colorsForBadge = palette[variant] || palette.default;
  const sizeForBadge = sizes[size] || sizes.md;
  return <View style={[styles.base, { backgroundColor: colorsForBadge.background, paddingVertical: sizeForBadge.vertical }, variant === 'outline' && styles.outline, style]}>{dot && <View style={[styles.dot, { backgroundColor: colorsForBadge.text }]} />}<Text style={[styles.text, { color: colorsForBadge.text, fontSize: sizeForBadge.fontSize }, textStyle]}>{children}</Text></View>;
};

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, gap: spacing.xs },
  outline: { borderWidth: 1, borderColor: colors.border.medium },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: typography.fontFamily.medium, fontWeight: typography.fontWeight.medium },
});
