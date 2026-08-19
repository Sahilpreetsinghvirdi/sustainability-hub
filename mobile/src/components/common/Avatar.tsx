// mobile/src/components/common/Avatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  shape = 'circle',
  status,
  onPress,
  style,
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const fontSizeMap = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 20,
    xl: 28,
  };

  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromName = (name: string) => {
    const colors = [
      colors.primary[500],
      colors.secondary[500],
      colors.warning,
      colors.error,
      colors.info,
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const borderRadiusValue = shape === 'circle' ? borderRadius.full : borderRadius.md;

  if (source) {
    return (
      <View
        style={[
          styles.container,
          { width: dimension, height: dimension, borderRadius: borderRadiusValue },
          style,
        ]}
      >
        <Image
          source={source}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: borderRadiusValue },
          ]}
        />
        {status && (
          <View
            style={[
              styles.statusBadge,
              { bottom: 0, right: 0, borderColor: colors.background.primary },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  width: dimension * 0.25,
                  height: dimension * 0.25,
                  backgroundColor:
                    status === 'online'
                      ? colors.success
                      : status === 'busy'
                      ? colors.error
                      : status === 'away'
                      ? colors.warning
                      : colors.neutral[400],
                  borderColor: colors.background.primary,
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  }

  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : colors.neutral[400];

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: borderRadiusValue,
          backgroundColor: bgColor,
        },
        style,
      ]}
      onPress={onPress}
      accessibilityLabel={name || 'User avatar'}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: colors.neutral[0],
          },
        ]}
      >
        {initials}
      </Text>
      {status && (
        <View
          style={[
            styles.statusBadge,
            { bottom: 0, right: 0, borderColor: bgColor },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                width: dimension * 0.25,
                height: dimension * 0.25,
                backgroundColor:
                  status === 'online'
                    ? colors.success
                    : status === 'busy'
                    ? colors.error
                    : status === 'away'
                    ? colors.warning
                    : colors.neutral[400],
                borderColor: bgColor,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    borderRadius: borderRadius.full,
  },
  initials: {
    fontWeight: typography.fontWeight.semibold,
  },
  statusBadge: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    padding: 1,
  },
  statusDot: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
});