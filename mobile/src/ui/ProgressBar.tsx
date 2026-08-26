import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, colors, typography } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  style?: any;
  variant?: string;
  size?: string;
  [key: string]: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, showLabel, label, style, variant = 'success' }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  const variantColor = variant === 'danger' ? colors.error : variant === 'warning' ? colors.warning : variant === 'info' ? colors.info : colors.primary[400];
  const fillColor = color || variantColor;
  return (
    <View style={style}>
      {showLabel && <Text style={styles.label}>{label || `${Math.round(clamped)}%`}</Text>}
      <View style={styles.track}><View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} /></View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { color: colors.text.secondary, fontSize: typography.fontSize.xs, marginBottom: 5 },
  track: { height: 7, backgroundColor: colors.background.tertiary, borderRadius: borderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: borderRadius.full },
});
