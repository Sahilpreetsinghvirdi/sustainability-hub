// mobile/src/ui/charts/PieChart.tsx
import React from 'react';
import { Stack, Text } from 'tamagui';

export type PieChartProps = {
  data?: { label: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  animate?: boolean;
  style?: any;
};

export function PieChart({ data = [], size = 160, showLegend = true, style }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <Stack alignItems="center" style={style}>
      <Stack width={size} height={size} borderRadius={size / 2} overflow="hidden" backgroundColor="#1E293B">
        <Stack flex={1} flexDirection="row">
          {data.map((d, i) => (
            <Stack key={i} flex={d.value} backgroundColor={d.color} />
          ))}
        </Stack>
      </Stack>
      {showLegend && (
        <Stack flexDirection="row" flexWrap="wrap" justifyContent="center" marginTop={8} gap={8}>
          {data.map((d, i) => (
            <Stack key={i} flexDirection="row" alignItems="center" gap={4}>
              <Stack width={8} height={8} borderRadius={4} backgroundColor={d.color} />
              <Text color="#94A3B8" fontSize={11}>{d.label} ({Math.round((d.value / total) * 100)}%)</Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
