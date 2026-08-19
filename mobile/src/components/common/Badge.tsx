// mobile/src/components/common/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
  textStyle,
}) => {
  const baseStyles = [styles.base, styles[variant], styles[size]];
  const textStyles = [styles.text, styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`], styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`], textStyle];

  if (dot) {
    return (
      <View style={[baseStyles, styles.dot, style]}>
        <View style={styles.dotIndicator} />
        <Text style={textStyles}>{children}</Text>
      </View>
    );
  }

  return (
    <View style={[baseStyles, style]}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
  },
  default: {
    backgroundColor: colors.neutral[200],
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  sm: {
    paddingVertical: 2,
    minHeight: 20,
  },
  md: {
    paddingVertical: 4,
    minHeight: 24,
  },
  lg: {
    paddingVertical: 6,
    minHeight: 28,
  },
  dot: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'currentColor',
  },
  text: {
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeight.medium,
  },
  textDefault: {
    color: colors.text.primary,
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textDanger: {
    color: colors.error,
  },
  textInfo: {
    color: colors.info,
  },
  textOutline: {
    color: colors.text.secondary,
  },
  textSm: {
    fontSize: typography.fontSize.xs,
  },
  textMd: {
    fontSize: typography.fontSize.sm,
  },
  textLg: {
    fontSize: typography.fontSize.md,
  },
});