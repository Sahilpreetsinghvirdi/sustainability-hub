// mobile/src/components/charts/PieChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { colors, spacing, typography } from '@/constants/theme';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'right';
  animate?: boolean;
  style?: ViewStyle;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  innerRadius = 60,
  showLegend = true,
  legendPosition = 'bottom',
  animate = true,
  style,
}) => {
  if (data.length === 0) {
    return <View style={[styles.container, { width: size, height: size }, style]} />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const outerRadius = center - spacing.sm;

  let currentAngle = -90; // Start at top

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

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
      'Z',
    ].join(' ');

    return { pathData, color: item.color, percentage, label: item.label, value: item.value };
  });

  return (
    <View style={[styles.container, { width: size, height: size + (showLegend && legendPosition === 'bottom' ? 80 : 0) }, style]}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <AnimatedSlice
              key={index}
              pathData={slice.pathData}
              color={slice.color}
              animate={animate}
              delay={index * 100}
            />
          ))}
        </G>
      </Svg>

      {showLegend && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color },
                ]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>
                {((item.value / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

interface AnimatedSliceProps {
  pathData: string;
  color: string;
  animate: boolean;
  delay: number;
}

const AnimatedSlice: React.FC<AnimatedSliceProps> = ({ pathData, color, animate, delay }) => {
  const animatedStroke = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animate) {
      Animated.timing(animatedStroke, {
        toValue: 1,
        duration: 800,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedStroke.setValue(1);
    }
  }, [animate, delay, animatedStroke]);

  return (
    <Animated.Path
      d={pathData}
      fill={color}
      stroke={colors.background.primary}
      strokeWidth={2}
      opacity={animatedStroke}
    />
  );
};

import { Animated, Easing } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legend: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    maxWidth: 300,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  legendValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});