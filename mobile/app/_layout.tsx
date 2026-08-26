import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Providers } from '@/store/providers';
import { colors } from '@/constants/theme';
import TopNavigation from '@/components/TopNavigation';

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
        <Stack
          screenOptions={{
            header: () => <TopNavigation />,
            headerShown: true,
            animation: 'fade',
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
      </SafeAreaView>
    </Providers>
  );
}
