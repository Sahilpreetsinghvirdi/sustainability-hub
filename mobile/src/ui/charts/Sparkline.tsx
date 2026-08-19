// mobile/src/ui/charts/Sparkline.tsx
import { Stack, StackProps } from '@tamagui/core';
import Svg, { Path } from 'react-native-svg';

export interface SparklineProps extends StackProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fillOpacity?: number;
}

export const Sparkline = ({ data, color = '$primary', width = 200, height = 60, strokeWidth = 2, fillOpacity = 0.1, style }: SparklineProps) => {
  if (data.length < 2) return <Stack width={width} height={height} style={style} />;

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return { x, y };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPathData = `M 0 ${height} ${pathData} L ${width} ${height} Z`;

  return (
    <Stack width={width} height={height} style={style}>
      <Svg width={width} height={height}>
        <Path d={fillPathData} fill={color} fillOpacity={fillOpacity} />
        <Path d={pathData} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Stack>
  );
};