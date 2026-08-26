import React from 'react';
import { Text as RNText, View, StyleSheet } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

const spacingMap: Record<string, number> = { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, xs: spacing.xs, sm: spacing.sm, md: spacing.md, lg: spacing.lg, xl: spacing.xl, xxl: spacing.xxl };
const borderRadiusMap: Record<string, number> = { none: 0, sm: borderRadius.sm, md: borderRadius.md, lg: borderRadius.lg, xl: borderRadius.xl, '2xl': 28, '3xl': 34, full: borderRadius.full };
const styleKeys = new Set(['flex', 'flexDirection', 'flexWrap', 'flexShrink', 'flexGrow', 'flexBasis', 'alignItems', 'alignSelf', 'alignContent', 'justifyContent', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical', 'gap', 'rowGap', 'columnGap', 'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderWidth', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'backgroundColor', 'opacity', 'overflow', 'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation', 'display']);

interface CardProps { children?: React.ReactNode; variant?: 'default' | 'elevated' | 'outlined' | 'filled'; style?: any; [key: string]: any }

export const Card: React.FC<CardProps> = ({ children, variant = 'default', style: styleProp, ...props }) => {
  const extracted: Record<string, any> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (!styleKeys.has(key)) return;
    if (typeof value === 'string' && borderRadiusMap[value] !== undefined) extracted[key] = borderRadiusMap[value];
    else if (typeof value === 'string' && (key.includes('padding') || key.includes('margin') || key.includes('gap')) && spacingMap[value] !== undefined) extracted[key] = spacingMap[value];
    else extracted[key] = value;
  });
  return <View style={[styles.card, variantStyles[variant], extracted, styleProp]}>{children}</View>;
};

const variantStyles = StyleSheet.create({
  default: {},
  elevated: { backgroundColor: colors.background.elevated, ...shadows.md },
  outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border.medium },
  filled: { backgroundColor: colors.background.secondary, borderWidth: 0 },
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border.light, padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.sm },
  headerText: { flex: 1 },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  headerSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginTop: spacing.xs },
});

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; style?: any }> = ({ title, subtitle, action, style }) => <View style={[styles.header, style]}><View style={styles.headerText}><RNText style={styles.headerTitle}>{title}</RNText>{subtitle && <RNText style={styles.headerSubtitle}>{subtitle}</RNText>}</View>{action && <View>{action}</View>}</View>;
