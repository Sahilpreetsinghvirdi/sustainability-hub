import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarData { label: string; value: number; color: string }

interface BarChartProps {
  data: BarData[];
  height?: number;
  style?: any;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 160, style }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <View style={[{ height }, style]}>
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.value}>{d.value}</Text>
            <View style={[styles.bar, { height: `${(d.value / max) * 80}%`, backgroundColor: d.color }]} />
            <Text style={styles.label}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 24, borderRadius: 4 },
  label: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  value: { color: '#F8FAFC', fontSize: 11, marginBottom: 4 },
});
