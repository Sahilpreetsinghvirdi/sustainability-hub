import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = '#22C55E', showLabel, label, style, ...rest }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={style}>
      {showLabel && <Text style={styles.label}>{label || `${clamped}%`}</Text>}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { color: '#F8FAFC', fontSize: 12, marginBottom: 4 },
  track: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
