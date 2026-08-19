// mobile/src/ui/charts/BarChart.tsx
import React from 'react';
import { Stack, Text } from 'tamagui';

export type BarChartProps = {
  data?: { label: string; value: number; color?: string }[];
  height?: number;
  width?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
  style?: any;
};

export function BarChart({ data = [], height = 200, style }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Stack height={height} style={style}>
      <Stack flex={1} flexDirection="row" alignItems="flex-end" gap={8}>
        {data.map((d, i) => (
          <Stack key={i} flex={1} alignItems="center">
            <Stack flex={1} justifyContent="flex-end">
              <Stack width="80%" borderRadius={4} backgroundColor={d.color || '#2563EB'} height={`${(d.value / max) * 100}%`} minHeight={4} />
            </Stack>
            <Text color="#94A3B8" fontSize={10} marginTop={4} textAlign="center">{d.label}</Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
