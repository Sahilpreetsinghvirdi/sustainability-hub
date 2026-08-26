import { Stack } from 'expo-router';
import { Providers } from '@/store/providers';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="carbon/manual" />
        <Stack.Screen name="carbon/review" />
        <Stack.Screen name="energy/audit" />
        <Stack.Screen name="energy/manual" />
        <Stack.Screen name="energy/review" />
        <Stack.Screen name="energy/appliances" />
        <Stack.Screen name="food-waste/log" />
        <Stack.Screen name="food-waste/detail" />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/household" />
        <Stack.Screen name="ai-tools/waste" />
        <Stack.Screen name="ai-tools/agri" />
        <Stack.Screen name="ai-tools/plant" />
      </Stack>
    </Providers>
  );
}
