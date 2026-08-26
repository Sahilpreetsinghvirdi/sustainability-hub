import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

interface BarData { label: string; value: number; color: string }
interface BarChartProps { data: BarData[]; height?: number; style?: any }

export const BarChart: React.FC<BarChartProps> = ({ data, height = 160, style }) => {
  const max = Math.max(...data.map(item => item.value), 1);
  return <View style={[{ height }, style]}><View style={styles.bars}>{data.map((item, index) => <View key={index} style={styles.barCol}><Text style={styles.value}>{item.value}</Text><View style={[styles.bar, { height: `${(item.value / max) * 80}%`, backgroundColor: item.color }]} /><Text style={styles.label}>{item.label}</Text></View>)}</View></View>;
};

const styles = StyleSheet.create({
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 24, borderRadius: 6 },
  label: { color: colors.text.tertiary, fontSize: 11, marginTop: 5 },
  value: { color: colors.text.secondary, fontSize: 11, marginBottom: 5, fontWeight: typography.fontWeight.medium },
});
