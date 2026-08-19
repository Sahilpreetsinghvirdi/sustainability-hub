// mobile/app/(tabs)/_layout.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/TabBarIcon';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let iconComponent: typeof Ionicons | typeof MaterialIcons | typeof Entypo = Ionicons;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'dashboard':
              iconName = focused ? 'analytics' : 'analytics-outline';
              iconComponent = MaterialIcons;
              break;
            case 'carbon':
              iconName = focused ? 'leaf' : 'leaf-outline';
              break;
            case 'energy':
              iconName = focused ? 'flash' : 'flash-outline';
              break;
            case 'food-waste':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'tamagui-demo':
              iconName = focused ? 'code' : 'code-outline';
              iconComponent = Ionicons;
              break;
            default:
              iconName = 'help-outline';
          }

          return <TabBarIcon focused={focused} color={color} size={size} iconName={iconName} iconComponent={iconComponent} />;
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#15233D',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="index" options={{ title: 'Home' }} />
      <Tab.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tab.Screen name="carbon" options={{ title: 'Carbon' }} />
      <Tab.Screen name="energy" options={{ title: 'Energy' }} />
      <Tab.Screen name="food-waste" options={{ title: 'Waste' }} />
      <Tab.Screen name="settings" options={{ title: 'Settings' }} />
      <Tab.Screen name="tamagui-demo" options={{ title: 'Tamagui' }} />
    </Tab.Navigator>
  );
}