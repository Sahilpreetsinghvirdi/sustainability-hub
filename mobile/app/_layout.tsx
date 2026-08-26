import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Providers } from '@/store/providers';
import { colors } from '@/constants/theme';
import TopNavigation from '@/components/TopNavigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAiConfigStore } from '@/store/aiConfigStore';

function RootStack() {
  const { isAuthenticated } = useAuthStore();
  const isConfigured = useAiConfigStore(s => s.provider === 'gemini' ? !!s.geminiKey : !!s.openaiKey);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuth = segments[0] === 'login' || segments[0] === 'create-account' || segments[0] === 'api-setup';
    if (!isAuthenticated && !inAuth) {
      router.replace('/login' as any);
    } else if (isAuthenticated && !isConfigured && !inAuth && segments[0] !== 'api-setup') {
      // after login, force API setup if not configured
      // allow user to skip, but we redirect once
      // we check if they are in tabs - redirect to api-setup
      const isInTabs = segments[0] === '(tabs)';
      if (isInTabs) router.replace('/api-setup' as any);
    } else if (isAuthenticated && isConfigured && inAuth) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isConfigured, segments]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
      <Stack
        screenOptions={{
          header: () => <TopNavigation />,
          headerShown: true,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="create-account" options={{ headerShown: false }} />
        <Stack.Screen name="api-setup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" />
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
