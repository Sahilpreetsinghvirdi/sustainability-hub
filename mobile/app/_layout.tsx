// mobile/app/_layout.tsx
import { Stack } from 'expo-router';
import { Providers } from '@/store/providers';

export default function RootLayout() {
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A1628' },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Providers>
  );
}
