// mobile/src/components/charts/SparklineChart.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Svg, Path, Line } from 'react-native-svg';
import { colors, spacing } from '@/constants/theme';

export interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  showDots?: boolean;
  dotColor?: string;
  fillOpacity?: number;
  style?: ViewStyle;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = colors.primary[500],
  width = 200,
  height = 60,
  strokeWidth = 2,
  showDots = false,
  dotColor = colors.neutral[0],
  fillOpacity = 0.1,
  style,
}) => {
  if (data.length < 2) {
    return <View style={[styles.container, { width, height }, style]} />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return { x, y };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const fillPathData = [
    `M 0 ${height}`,
    pathData,
    `L ${width} ${height}`,
    'Z',
  ].join(' ');

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={width} height={height}>
        {/* Fill area */}
        <Path
          d={fillPathData}
          fill={color}
          fillOpacity={fillOpacity}
        />
        {/* Line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={3}
              fill={dotColor}
              stroke={color}
              strokeWidth={2}
            />
          ))}
      </Svg>
    </View>
  );
};

interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

const Circle: React.FC<CircleProps> = ({ cx, cy, r, fill, stroke, strokeWidth }) => (
  <View>
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
