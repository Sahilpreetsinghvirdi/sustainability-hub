// mobile/src/components/common/Button.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = React.forwardRef<Pressable, ButtonProps>(
  (
    {
      title,
      onPress,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      style,
      textStyle,
    },
    ref
  ) => {
    const baseStyles = [
      styles.base,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ];

    const textStyles = [
      styles.textBase,
      styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
      disabled && styles.textDisabled,
      textStyle,
    ];

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        style={baseStyles}
        android_ripple={{ color: colors.neutral[300] }}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityLabel={loading ? 'Loading' : title}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? colors.neutral[0] : colors.primary[500]}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text style={textStyles}>{title}</Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  textBase: {
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  textPrimary: {
    color: colors.neutral[0],
  },
  textSecondary: {
    color: colors.neutral[0],
  },
  textOutline: {
    color: colors.primary[500],
  },
  textGhost: {
    color: colors.primary[500],
  },
  textDanger: {
    color: colors.neutral[0],
  },
  textSm: {
    fontSize: typography.fontSize.sm,
  },
  textMd: {
    fontSize: typography.fontSize.md,
  },
  textLg: {
    fontSize: typography.fontSize.lg,
  },
  textDisabled: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});