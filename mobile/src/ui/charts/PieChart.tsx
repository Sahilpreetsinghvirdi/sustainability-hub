import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface PieData { label: string; value: number; color: string }
interface PieChartProps { data: PieData[]; size?: number; style?: any }

export const PieChart: React.FC<PieChartProps> = ({ data, size = 160, style }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <View style={[{ alignItems: 'center' }, style]}><View style={[styles.pie, { width: size, height: size, borderRadius: size / 2 }]}>{total > 0 && data.map((item, index) => <View key={index} style={{ width: `${(item.value / total) * 100}%`, height: '100%', backgroundColor: item.color }} />)}</View><View style={styles.legend}>{data.map((item, index) => <View key={index} style={styles.legendItem}><View style={[styles.dot, { backgroundColor: item.color }]} /><Text style={styles.label}>{item.label}</Text><Text style={styles.value}>{item.value}</Text></View>)}</View></View>;
};

const styles = StyleSheet.create({
  pie: { backgroundColor: colors.background.tertiary, overflow: 'hidden', flexDirection: 'row' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.md, gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: colors.text.secondary, fontSize: typography.fontSize.xs },
  value: { color: colors.text.primary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
});
