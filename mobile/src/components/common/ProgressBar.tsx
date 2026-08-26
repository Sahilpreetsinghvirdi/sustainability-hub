import React from 'react';
import { Animated, Easing, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export interface ProgressBarProps { progress: number; variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean; label?: string; animated?: boolean; style?: ViewStyle }

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, variant = 'default', size = 'md', showLabel = false, label, animated = true, style }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedWidth = React.useRef(new Animated.Value(0)).current;
  const fillColor = variant === 'success' ? colors.success : variant === 'warning' ? colors.warning : variant === 'danger' ? colors.error : colors.primary[400];

  React.useEffect(() => {
    if (animated) Animated.timing(animatedWidth, { toValue: clampedProgress, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    else animatedWidth.setValue(clampedProgress);
  }, [animated, animatedWidth, clampedProgress]);

  const height = size === 'sm' ? 5 : size === 'lg' ? 11 : 8;
  return <View style={[styles.container, style]}>{(showLabel || label) && <View style={styles.labelRow}><Text style={styles.labelText}>{label || `${Math.round(clampedProgress)}%`}</Text>{showLabel && <Text style={styles.labelValue}>{Math.round(clampedProgress)}%</Text>}</View>}<View style={[styles.track, { height, borderRadius: height / 2 }]}><Animated.View style={[styles.fill, { height, borderRadius: height / 2, backgroundColor: fillColor, width: animatedWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} /></View></View>;
};

const styles = StyleSheet.create({
  container: { width: '100%', gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary },
  labelValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  track: { backgroundColor: colors.background.tertiary, overflow: 'hidden' },
  fill: { height: '100%' },
});
