import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { id: 'home', label: 'Home', icon: 'home-outline' as const, iconActive: 'home' as const, path: '/' },
  { id: 'ai', label: 'AI', icon: 'sparkles-outline' as const, iconActive: 'sparkles' as const, path: '/ai-tools' },
  { id: 'stats', label: 'Stats', icon: 'stats-chart-outline' as const, iconActive: 'stats-chart' as const, path: '/carbon' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' as const, iconActive: 'settings' as const, path: '/settings' },
];

function isActive(pathname: string, tabId: string) {
  if (tabId === 'home') return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index' || pathname.startsWith('/dashboard');
  if (tabId === 'ai') return pathname.includes('/ai-tools');
  if (tabId === 'stats')
    return pathname.includes('/carbon') || pathname.includes('/energy') || pathname.includes('/food-waste') || pathname.includes('/stats');
  if (tabId === 'settings') return pathname.includes('/settings');
  return false;
}

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map(tab => {
          const active = isActive(pathname, tab.id);
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                if (!active) router.replace(tab.path as any);
              }}
              style={styles.tabItem}
            >
              <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? '#0A0A0A' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  tabLabelActive: { color: '#0A0A0A', fontWeight: '700' },
});
