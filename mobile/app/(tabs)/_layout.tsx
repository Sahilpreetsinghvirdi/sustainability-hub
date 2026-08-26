import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CarbonScreen } from '@/screens/CarbonScreen';
import { EnergyScreen } from '@/screens/EnergyScreen';
import { FoodWasteScreen } from '@/screens/FoodWasteScreen';
import AiToolsHubScreen from '@/screens/AiToolsHubScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerShown: false,
      }}
    >
      <Tab.Screen name="index" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="carbon" component={CarbonScreen} options={{ title: 'Carbon' }} />
      <Tab.Screen name="energy" component={EnergyScreen} options={{ title: 'Energy' }} />
      <Tab.Screen name="food-waste" component={FoodWasteScreen} options={{ title: 'Waste' }} />
      <Tab.Screen name="ai-tools" component={AiToolsHubScreen} options={{ title: 'AI tools' }} />
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}
