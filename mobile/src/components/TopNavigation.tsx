import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import softwareLogo from '@/assets/logo.png';

type IconName = keyof typeof Ionicons.glyphMap;

type NavigationItem = {
  label: string;
  path: string;
  icon: IconName;
};

type NavigationGroup = {
  title?: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  { items: [{ label: 'Dashboard', path: '/', icon: 'grid-outline' }] },
  {
    title: 'AI Tools',
    items: [
      { label: 'AI Waste Analyzer', path: '/ai-tools/waste', icon: 'scan-outline' },
      { label: 'AgriSense', path: '/ai-tools/agri', icon: 'leaf-outline' },
      { label: 'PlantSense', path: '/ai-tools/plant', icon: 'heart-outline' },
    ],
  },
  {
    title: 'Sustainability Tracker',
    items: [
      { label: 'Carbon', path: '/carbon', icon: 'leaf-outline' },
      { label: 'Energy', path: '/energy', icon: 'flash-outline' },
      { label: 'Food Waste', path: '/food-waste', icon: 'restaurant-outline' },
    ],
  },
  { title: 'System', items: [{ label: 'Settings', path: '/settings', icon: 'settings-outline' }] },
];

const isActivePath = (pathname: string, path: string) => {
  if (path === '/') return pathname === '/' || pathname === '/(tabs)' || pathname.startsWith('/dashboard');
  return pathname === path || pathname.startsWith(`${path}/`);
};

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTransition = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    activeTransition.setValue(0.96);
    Animated.spring(activeTransition, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
  }, [activeTransition, pathname]);

  const navigate = (path: string) => {
    if (!isActivePath(pathname, path)) router.replace(path as never);
  };

  return (
    <View style={styles.shell}>
      <View style={styles.brandRow}>
        <Image source={softwareLogo} style={styles.brandMark} />
        <View>
          <Text style={styles.brandTitle}>Sustainability Hub</Text>
          <Text style={styles.brandCaption}>PERSONAL IMPACT PLATFORM</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navigationRail}>
        {navigationGroups.map((group, groupIndex) => (
          <View key={group.title || groupIndex} style={styles.group}>
            {group.title && <Text style={styles.groupTitle}>{group.title}</Text>}
            <View style={styles.groupItems}>
              {group.items.map(item => {
                const active = isActivePath(pathname, item.path);
                return (
                  <Animated.View key={item.path} style={active ? { transform: [{ scale: activeTransition }] } : undefined}>
                    <Pressable
                      onPress={() => navigate(item.path)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [styles.navigationItem, active && styles.navigationItemActive, pressed && styles.navigationItemPressed]}
                    >
                      <Ionicons name={item.icon} size={14} color={active ? colors.background.primary : colors.text.secondary} />
                      <Text style={[styles.navigationLabel, active && styles.navigationLabelActive]}>{item.label}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.background.card, borderBottomWidth: 1, borderBottomColor: colors.border.light, paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  brandRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.sm },
  brandMark: { borderRadius: borderRadius.sm, height: 30, width: 30 },
  brandTitle: { color: colors.text.primary, fontSize: 15, fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  brandCaption: { color: colors.text.tertiary, fontSize: 8, fontWeight: typography.fontWeight.bold, letterSpacing: 1.2, marginTop: 2, textAlign: 'center' },
  navigationRail: { alignItems: 'flex-end', flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xs, gap: spacing.sm },
  group: { gap: 4 },
  groupTitle: { color: colors.text.tertiary, fontSize: 8, fontWeight: typography.fontWeight.bold, letterSpacing: 0.8, paddingLeft: 4, textTransform: 'uppercase' },
  groupItems: { flexDirection: 'row', gap: 4 },
  navigationItem: { alignItems: 'center', borderColor: colors.border.light, borderRadius: borderRadius.sm, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 10 },
  navigationItemActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  navigationItemPressed: { opacity: 0.72 },
  navigationLabel: { color: colors.text.secondary, fontSize: 11, fontWeight: typography.fontWeight.semibold },
  navigationLabelActive: { color: colors.background.primary },
});
