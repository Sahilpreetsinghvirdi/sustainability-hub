// mobile/app/_layout.tsx
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Providers } from '@/store/providers';
import { useAuth } from '@/store/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A1628' },
        }}
      >
        {isLoading ? (
          <Stack.Screen name="splash" options={{ presentation: 'modal' }} />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal/**" options={{ presentation: 'modal' }} />
          </>
        ) : (
          <Stack.Screen name="auth/**" options={{ presentation: 'modal' }} />
        )}
      </Stack>
    </Providers>
  );
}