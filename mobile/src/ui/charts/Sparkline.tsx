import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface SparklineProps { data: number[]; color?: string; width?: number; height?: number; style?: any }

export const Sparkline: React.FC<SparklineProps> = ({ data, color = colors.primary[400], width = 200, height = 60, style }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return <View style={[{ width, height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }, style]}>{data.map((value, index) => <View key={index} style={{ flex: 1, height: `${Math.max(5, ((value - min) / range) * 100)}%`, backgroundColor: color, borderRadius: 3, opacity: 0.48 + ((value - min) / range) * 0.52 }} />)}</View>;
};
