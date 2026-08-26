import React from 'react';
import { Pressable, Text, View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';

export interface CardProps { children: React.ReactNode; variant?: 'default' | 'elevated' | 'outlined' | 'filled'; padding?: 'none' | 'sm' | 'md' | 'lg'; onPress?: () => void; style?: ViewStyle; testID?: string }

const variantStyles = StyleSheet.create({
  default: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light },
  elevated: { backgroundColor: colors.background.elevated, ...shadows.md },
  outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border.medium },
  filled: { backgroundColor: colors.background.secondary },
});
const paddingStyles = StyleSheet.create({
  none: { padding: 0 },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
});

export const Card = React.forwardRef<any, CardProps>(({ children, variant = 'default', padding = 'md', onPress, style, testID }, ref) => {
  const Component = onPress ? Pressable : View;
  return <Component ref={ref} onPress={onPress} style={[styles.base, variantStyles[variant], paddingStyles[padding], style]} testID={testID} accessibilityRole={onPress ? 'button' : undefined} android_ripple={onPress ? { color: colors.border.medium } : undefined}>{children}</Component>;
});

Card.displayName = 'Card';

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; style?: ViewStyle }> = ({ title, subtitle, action, style }) => (
  <View style={[styles.header, style]}>
    <View style={styles.headerText}><Text style={styles.headerTitle}>{title}</Text>{subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}</View>
    {action && <View style={styles.headerAction}>{action}</View>}
  </View>
);

const styles = StyleSheet.create({
  base: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.sm },
  headerText: { flex: 1 },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  headerSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginTop: spacing.xs },
  headerAction: { marginLeft: spacing.md },
});
