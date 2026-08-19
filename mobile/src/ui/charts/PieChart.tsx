// mobile/src/ui/charts/PieChart.tsx
import { Stack, StackProps, Text } from '@tamagui/core';
import Svg, { Path, G } from 'react-native-svg';
import { Animated, Easing } from 'react-native';

export interface PieChartData { label: string; value: number; color: string; }

export interface PieChartProps extends StackProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  animate?: boolean;
}

export const PieChart = ({ data, size = 200, innerRadius = 60, showLegend = true, animate = true, style }: PieChartProps) => {
  if (data.length === 0) return <Stack width={size} height={size} style={style} />;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const outerRadius = center - 8;

  let currentAngle = -90;
  const slices = data.map(item => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const innerX1 = center + innerRadius * Math.cos(startRad);
    const innerY1 = center + innerRadius * Math.sin(startRad);
    const innerX2 = center + innerRadius * Math.cos(endRad);
    const innerY2 = center + innerRadius * Math.sin(endRad);

    const pathData = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`;

    return { pathData, color: item.color, percentage, label: item.label, value: item.value };
  });

  return (
    <Stack width={size} height={size + (showLegend ? 80 : 0)} style={style}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <AnimatedSlice key={index} pathData={slice.pathData} color={slice.color} animate={animate} delay={index * 100} />
          ))}
        </G>
      </Svg>

      {showLegend && (
        <Stack flexDirection="row" flexWrap="wrap" justifyContent="center" gap="$3" marginTop="$3" maxWidth={300}>
          {data.map((item, index) => (
            <Stack key={index} flexDirection="row" alignItems="center" gap="$1">
              <Stack width={12} height={12} borderRadius="$1" backgroundColor={item.color} />
              <Text fontSize="$2" fontWeight="500" color="$color">{item.label}</Text>
              <Text fontSize="$2" color="$colorFocus">{((item.value / total) * 100).toFixed(1)}%</Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

interface AnimatedSliceProps { pathData: string; color: string; animate: boolean; delay: number; }

const AnimatedSlice = ({ pathData, color, animate, delay }: AnimatedSliceProps) => {
  const animatedStroke = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (animate) {
      Animated.timing(animatedStroke, { toValue: 1, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    } else { animatedStroke.setValue(1); }
  }, [animate, delay, animatedStroke]);

  return <Animated.Path d={pathData} fill={color} stroke="$background" strokeWidth={2} opacity={animatedStroke} />;
};