import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

const variants: Record<string, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary[500], text: colors.background.primary },
  secondary: { bg: colors.secondary[500], text: colors.background.primary },
  outline: { bg: 'transparent', text: colors.primary[300], border: colors.primary[400] },
  ghost: { bg: 'transparent', text: colors.primary[300] },
  danger: { bg: colors.error, text: colors.background.primary },
};

const sizes = {
  xs: { h: 30, px: 12, fs: 12 },
  sm: { h: 38, px: 16, fs: 14 },
  md: { h: 48, px: 24, fs: 16 },
  lg: { h: 56, px: 32, fs: 18 },
};

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', fullWidth, loading, disabled, onPress, leftIcon, style }) => {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[styles.btn, { height: s.h, paddingHorizontal: s.px, backgroundColor: v.bg }, v.border && { borderWidth: 1, borderColor: v.border }, fullWidth && styles.fullWidth, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={v.text} size="small" /> : <>{leftIcon}{leftIcon && <View style={styles.iconGap} />}<Text style={{ color: v.text, fontSize: s.fs, fontWeight: typography.fontWeight.bold }}>{children}</Text></>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', ...shadows.sm },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  iconGap: { width: spacing.sm },
});