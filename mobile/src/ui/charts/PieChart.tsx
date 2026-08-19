import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PieData { label: string; value: number; color: string }

interface PieChartProps {
  data: PieData[];
  size?: number;
  style?: any;
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 160, style }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#334155', overflow: 'hidden', flexDirection: 'row' }}>
        {data.map((d, i) => {
          const pct = (d.value / total) * 100;
          return (
            <View key={i} style={{ width: `${pct}%`, height: '100%', backgroundColor: d.color }} />
          );
        })}
      </View>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.label}>{d.label}</Text>
            <Text style={styles.value}>{d.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: '#CBD5E1', fontSize: 12 },
  value: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
});
