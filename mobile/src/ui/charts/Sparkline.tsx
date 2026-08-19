// mobile/src/ui/charts/Sparkline.tsx
import React from 'react';
import { Stack } from 'tamagui';

export type SparklineProps = {
  data?: number[];
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
  fillOpacity?: number;
  style?: any;
};

export function Sparkline({ data = [], color = '#2563EB', height = 40, width = 120, style }: SparklineProps) {
  const max = Math.max(...data, 1);
  return (
    <Stack width={width} height={height} flexDirection="row" alignItems="flex-end" gap={2} style={style}>
      {data.map((v, i) => (
        <Stack key={i} flex={1} height={`${(v / max) * 100}%`} backgroundColor={color} borderRadius={2} opacity={0.8} />
      ))}
    </Stack>
  );
}
