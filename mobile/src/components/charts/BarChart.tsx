// mobile/src/components/charts/BarChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Svg, Rect, G } from 'react-native-svg';
import { colors, spacing, typography } from '@/constants/theme';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  maxValue?: number;
  showValues?: boolean;
  showLabels?: boolean;
  barWidth?: number;
  barGap?: number;
  animate?: boolean;
  style?: ViewStyle;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 300,
  height = 200,
  maxValue,
  showValues = false,
  showLabels = true,
  barWidth = 30,
  barGap = 12,
  animate = true,
  style,
}) => {
  if (data.length === 0) {
    return <View style={[styles.container, { width, height }, style]} />;
  }

  const calculatedMax = maxValue || Math.max(...data.map(d => d.value)) * 1.1;
  const chartHeight = height - (showLabels ? 30 : 0) - spacing.md;
  const totalBarsWidth = data.length * barWidth + (data.length - 1) * barGap;
  const startX = (width - totalBarsWidth) / 2;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={width} height={height}>
        <G>
          {data.map((item, index) => {
            const barHeight = (item.value / calculatedMax) * chartHeight;
            const x = startX + index * (barWidth + barGap);
            const y = chartHeight - barHeight + (showLabels ? 30 : 0);

            return (
              <View key={index}>
                <AnimatedBar
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  color={item.color || colors.primary[500]}
                  animate={animate}
                  delay={index * 100}
                />
                {showValues && (
                  <Text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={typography.fontSize.xs}
                    fill={colors.text.primary}
                    fontWeight={typography.fontWeight.medium}
                  >
                    {item.value.toFixed(1)}
                  </Text>
                )}
                {showLabels && (
                  <Text
                    x={x + barWidth / 2}
                    y={chartHeight + 22}
                    textAnchor="middle"
                    fontSize={typography.fontSize.xs}
                    fill={colors.text.tertiary}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

interface AnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  animate: boolean;
  delay: number;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ x, y, width, height, color, animate, delay }) => {
  const animatedHeight = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animate) {
      Animated.timing(animatedHeight, {
        toValue: height,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedHeight.setValue(height);
    }
  }, [height, animate, delay, animatedHeight]);

  return (
    <Animated.View
      style={{
        transform: [{ scaleY: animatedHeight.interpolate({ inputRange: [0, height], outputRange: [0, 1] }) }],
      }}
    >
      <Rect
        x={x}
        y={y + height}
        width={width}
        height={-height}
        fill={color}
        rx={4}
        ry={4}
      />
    </Animated.View>
  );
};

import { Animated, Easing } from 'react-native';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});