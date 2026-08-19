import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  style?: any;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = '#22C55E', width = 200, height = 60, style }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <View style={[{ width, height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }, style]}>
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: `${((v - min) / range) * 100}%`,
            backgroundColor: color,
            borderRadius: 2,
            opacity: 0.5 + (v - min) / range * 0.5,
          }}
        />
      ))}
    </View>
  );
};
