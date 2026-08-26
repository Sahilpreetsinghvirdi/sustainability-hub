import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';

export default function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const theme = useSettingsStore(s => s.theme);
  const setTheme = useSettingsStore(s => s.setTheme);
  const isDark = theme === 'dark';
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, { damping: 18, stiffness: 180 });
  }, [isDark, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#0A0A0A', '#1E293B']),
    borderColor: interpolateColor(progress.value, [0, 1], ['#0A0A0A', '#334155']),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(isDark ? (size === 'sm' ? 18 : 22) : 0, { damping: 18, stiffness: 220 }) }],
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDark ? 0 : 1, { duration: 180 }),
    transform: [{ rotate: `${withTiming(isDark ? 90 : 0, { duration: 220 })}deg` }, { scale: withTiming(isDark ? 0.4 : 1, { duration: 200 }) }],
  }));
  const moonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDark ? 1 : 0, { duration: 180 }),
    transform: [{ rotate: `${withTiming(isDark ? 0 : -90, { duration: 220 })}deg` }, { scale: withTiming(isDark ? 1 : 0.4, { duration: 200 }) }],
  }));

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next as any);
  };

  const w = size === 'sm' ? 42 : 52;
  const h = size === 'sm' ? 26 : 30;

  return (
    <Pressable onPress={toggle} accessibilityLabel={isDark ? 'Switch to light' : 'Switch to dark'} style={styles.hit}>
      <Animated.View style={[styles.track, { width: w, height: h }, trackStyle]}>
        {/* stars - only visible in dark */}
        <Animated.View style={[styles.star, { top: 5, left: 8, opacity: progress }]} />
        <Animated.View style={[styles.star, { top: 14, left: 14, opacity: progress }]} />
        <Animated.View style={[styles.star, { top: 7, left: 19, opacity: progress }]} />
        <Animated.View style={[styles.knob, knobStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, sunStyle]}>
            <Ionicons name="sunny" size={size === 'sm' ? 12 : 14} color="#F59E0B" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, moonStyle]}>
            <Ionicons name="moon" size={size === 'sm' ? 11 : 13} color="#6366F1" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 4 },
  track: { borderRadius: 9999, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 2, overflow: 'hidden' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' },
});
