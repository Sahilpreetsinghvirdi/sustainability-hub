// mobile/src/components/common/Card.tsx
import React from 'react';
import { View, ViewStyle, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card = React.forwardRef<Pressable | View, CardProps>(
  ({ children, variant = 'default', padding = 'md', onPress, style, testID }, ref) => {
    const Component = onPress ? Pressable : View;

    const baseStyles = [
      styles.base,
      styles[variant],
      styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
      style,
    ];

    return (
      <Component
        ref={ref}
        onPress={onPress}
        style={baseStyles}
        testID={testID}
        accessibilityRole={onPress ? 'button' : undefined}
        android_ripple={onPress ? { color: colors.neutral[300] } : undefined}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  elevated: {
    backgroundColor: colors.background.card,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  filled: {
    backgroundColor: colors.background.secondary,
  },
  paddingnone: {
    padding: 0,
  },
  paddingsm: {
    padding: spacing.sm,
  },
  paddingmd: {
    padding: spacing.md,
  },
  paddinglg: {
    padding: spacing.lg,
  },
});

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => (
  <View style={[styles.header, style]}>
    <View style={styles.headerContent}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {action && <View style={styles.headerAction}>{action}</View>}
    </View>
  </View>
);

const CardHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  headerAction: {
    marginLeft: spacing.md,
  },
});