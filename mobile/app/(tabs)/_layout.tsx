import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/TabBarIcon';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import HomeScreen from '../index';
import { CarbonScreen } from '@/screens/CarbonScreen';
import { EnergyScreen } from '@/screens/EnergyScreen';
import { FoodWasteScreen } from '@/screens/FoodWasteScreen';
import AiToolsHubScreen from '@/screens/AiToolsHubScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, { active: string; inactive: string }> = {
  index: { active: 'home', inactive: 'home-outline' },
  carbon: { active: 'leaf', inactive: 'leaf-outline' },
  energy: { active: 'flash', inactive: 'flash-outline' },
  'food-waste': { active: 'restaurant', inactive: 'restaurant-outline' },
  'ai-tools': { active: 'sparkles', inactive: 'sparkles-outline' },
};

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = tabIcons[route.name] || { active: 'help', inactive: 'help-outline' };
          return <TabBarIcon focused={focused} color={color} size={size} iconName={focused ? icon.active : icon.inactive} iconComponent={Ionicons} />;
        },
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: { height: 78, paddingTop: 8, paddingBottom: 10, backgroundColor: colors.background.card, borderTopWidth: 1, borderTopColor: colors.border.light, elevation: 0, shadowOpacity: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name="index" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="carbon" component={CarbonScreen} options={{ title: 'Carbon' }} />
      <Tab.Screen name="energy" component={EnergyScreen} options={{ title: 'Energy' }} />
      <Tab.Screen name="food-waste" component={FoodWasteScreen} options={{ title: 'Waste' }} />
      <Tab.Screen name="ai-tools" component={AiToolsHubScreen} options={{ title: 'AI tools' }} />
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}