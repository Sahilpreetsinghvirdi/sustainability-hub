// mobile/src/components/common/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

import { ViewStyle } from 'react-native';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressFraction = clampedProgress / 100;

  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progressFraction,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progressFraction);
    }
  }, [progressFraction, animated]);

  const getTrackColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.error;
      case 'gradient':
        return colors.primary[500];
      default:
        return colors.primary[500];
    }
  };

  const height = size === 'sm' ? 4 : size === 'lg' ? 12 : 8;
  const borderRadiusValue = size === 'sm' ? 2 : size === 'lg' ? 6 : 4;

  return (
    <View style={[styles.container, style]} style={{ gap: spacing.xs }}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label || `${Math.round(clampedProgress)}%`}</Text>
          {showLabel && <Text style={styles.labelValue}>{Math.round(clampedProgress)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: borderRadiusValue }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: borderRadiusValue,
              backgroundColor: getTrackColor(),
              transform: [{ scaleX: animatedWidth }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  labelValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  track: {
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    transformOrigin: 'left',
  },
});