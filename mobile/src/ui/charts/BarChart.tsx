// mobile/src/ui/charts/BarChart.tsx
import { Stack, StackProps, Text } from '@tamagui/core';
import Svg, { Rect, G } from 'react-native-svg';
import { Animated, Easing } from 'react-native';

export interface BarChartData { label: string; value: number; color?: string; }

export interface BarChartProps extends StackProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  maxValue?: number;
  showValues?: boolean;
  showLabels?: boolean;
  barWidth?: number;
  barGap?: number;
  animate?: boolean;
}

export const BarChart = ({ data, width = 300, height = 200, maxValue, showValues = false, showLabels = true, barWidth = 30, barGap = 12, animate = true, style }: BarChartProps) => {
  if (data.length === 0) return <Stack width={width} height={height} style={style} />;

  const calculatedMax = maxValue || Math.max(...data.map(d => d.value)) * 1.1;
  const chartHeight = height - (showLabels ? 30 : 0) - 16;
  const totalBarsWidth = data.length * barWidth + (data.length - 1) * barGap;
  const startX = (width - totalBarsWidth) / 2;

  return (
    <Stack width={width} height={height} style={style}>
      <Svg width={width} height={height}>
        <G>
          {data.map((item, index) => {
            const barHeight = (item.value / calculatedMax) * chartHeight;
            const x = startX + index * (barWidth + barGap);
            const y = chartHeight - barHeight + (showLabels ? 30 : 0);

            return (
              <G key={index}>
                <AnimatedBar x={x} y={y} width={barWidth} height={barHeight} color={item.color || '$primary'} animate={animate} delay={index * 100} />
                {showValues && (
                  <Text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="$1" fill="$color" fontWeight="500">
                    {item.value.toFixed(1)}
                  </Text>
                )}
                {showLabels && (
                  <Text x={x + barWidth / 2} y={chartHeight + 22} textAnchor="middle" fontSize="$1" fill="$colorFocus">
                    {item.label}
                  </Text>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
    </Stack>
  );
};

interface AnimatedBarProps { x: number; y: number; width: number; height: number; color: string; animate: boolean; delay: number; }

const AnimatedBar = ({ x, y, width, height, color, animate, delay }: AnimatedBarProps) => {
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (animate) {
      Animated.timing(animatedHeight, { toValue: height, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    } else { animatedHeight.setValue(height); }
  }, [height, animate, delay, animatedHeight]);

  return (
    <Animated.View style={{ transform: [{ scaleY: animatedHeight.interpolate({ inputRange: [0, height], outputRange: [0, 1] }) }] }}>
      <Rect x={x} y={y + height} width={width} height={-height} fill={color} rx={4} ry={4} />
    </Animated.View>
  );
};