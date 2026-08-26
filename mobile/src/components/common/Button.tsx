import React from 'react';
import { ActivityIndicator, Pressable, Text, View, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; loading?: boolean; fullWidth?: boolean; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; style?: ViewStyle; textStyle?: TextStyle }

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary[500] },
  secondary: { backgroundColor: colors.secondary[500] },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary[400] },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
});
const textColors = { primary: colors.background.primary, secondary: colors.background.primary, outline: colors.primary[300], ghost: colors.primary[300], danger: colors.background.primary };
const sizeStyles = StyleSheet.create({
  sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 36 },
  md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minHeight: 48 },
  lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, minHeight: 56 },
});

export const Button = React.forwardRef<any, ButtonProps>(({ title, onPress, variant = 'primary', size = 'md', disabled = false, loading = false, fullWidth = false, leftIcon, rightIcon, style, textStyle }, ref) => (
  <Pressable ref={ref} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.base, variantStyles[variant], sizeStyles[size], fullWidth && styles.fullWidth, (disabled || loading) && styles.disabled, pressed && styles.pressed, style]} android_ripple={{ color: colors.border.medium }} accessibilityRole="button" accessibilityState={{ disabled: disabled || loading }} accessibilityLabel={loading ? 'Loading' : title}>
    {loading ? <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? colors.background.primary : colors.primary[400]} /> : <>{leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}<Text style={[styles.textBase, { color: textColors[variant], fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16 }, textStyle]}>{title}</Text>{rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}</>}
  </Pressable>
));

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.84 },
  textBase: { fontFamily: typography.fontFamily.medium, fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});
