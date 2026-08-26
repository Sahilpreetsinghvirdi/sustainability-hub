import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Providers } from '@/store/providers';
import { colors } from '@/constants/theme';
import TopNavigation from '@/components/TopNavigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAiConfigStore } from '@/store/aiConfigStore';

function RootStack() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const hasHydrated = useAuthStore.persist.hasHydrated();
  const isConfigured = useAiConfigStore(s => (s.provider === 'gemini' ? !!s.geminiKey : !!s.openaiKey));
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // wait for MMKV rehydration
    if (!hasHydrated) return;
    // clear loading after hydrate
    if (isLoading) useAuthStore.getState().setLoading(false);
    setReady(true);
  }, [hasHydrated, isLoading]);

  useEffect(() => {
    if (!ready || !hasHydrated) return;
    if (segments.length === 0) return; // navigation not ready
    const seg0 = segments[0] as string;
    const inAuth = seg0 === 'login' || seg0 === 'create-account' || seg0 === 'api-setup';
    // avoid double navigation: use timeout to let navigation mount
    const t = setTimeout(() => {
      try {
        if (!isAuthenticated && !inAuth) {
          router.replace('/login' as any);
        } else if (isAuthenticated && !isConfigured && seg0 === '(tabs)') {
          router.replace('/api-setup' as any);
        } else if (isAuthenticated && isConfigured && inAuth) {
          router.replace('/' as any);
        }
      } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [isAuthenticated, isConfigured, segments, ready, hasHydrated]);

  if (!ready || !hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator color="#0A0A0A" />
        <Text style={{ marginTop: 12, fontSize: 12, color: '#6B7280', fontWeight: '600' }}>Loading Sustainability Hub…</Text>
      </View>
    );
  }

  const seg0 = segments[0] as string;
  const inAuth = seg0 === 'login' || seg0 === 'create-account' || seg0 === 'api-setup';
  const showHeader = !inAuth;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
      <Stack
        screenOptions={{
          header: showHeader ? () => <TopNavigation /> : () => null,
          headerShown: showHeader,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="create-account" options={{ headerShown: false }} />
        <Stack.Screen name="api-setup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: showHeader }} />
        <Stack.Screen name="carbon/manual" options={{ headerShown: false }} />
        <Stack.Screen name="carbon/review" options={{ headerShown: false }} />
        <Stack.Screen name="energy/audit" options={{ headerShown: false }} />
        <Stack.Screen name="energy/manual" options={{ headerShown: false }} />
        <Stack.Screen name="energy/review" options={{ headerShown: false }} />
        <Stack.Screen name="energy/appliances" options={{ headerShown: false }} />
        <Stack.Screen name="food-waste/log" options={{ headerShown: false }} />
        <Stack.Screen name="food-waste/detail" options={{ headerShown: false }} />
        <Stack.Screen name="settings/profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings/household" options={{ headerShown: false }} />
        <Stack.Screen name="settings/avatar" options={{ headerShown: false }} />
        <Stack.Screen name="ai-tools/waste" options={{ headerShown: false }} />
        <Stack.Screen name="ai-tools/agri" options={{ headerShown: false }} />
        <Stack.Screen name="ai-tools/plant" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      <RootStack />
    </Providers>
  );
}
