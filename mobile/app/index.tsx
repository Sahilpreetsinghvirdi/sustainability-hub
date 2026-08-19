import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, Button, Card, Badge, ProgressBar } from '@/ui';
import { colors, spacing } from '@/constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const features = [
    { name: 'Dashboard', icon: 'analytics', component: MaterialIcons, color: '#0EA5E9', route: '/dashboard', desc: 'Unified sustainability view' },
    { name: 'Carbon Tracker', icon: 'leaf', component: Ionicons, color: '#22C55E', route: '/carbon', desc: 'Receipt scanning & footprint' },
    { name: 'Energy Monitor', icon: 'flash', component: Ionicons, color: '#F59E0B', route: '/energy', desc: 'Bills & appliance audit' },
    { name: 'Food Waste', icon: 'restaurant', component: Ionicons, color: '#EF4444', route: '/food-waste', desc: 'Meal logging & streaks' },
    { name: 'Settings', icon: 'settings', component: Ionicons, color: '#64748B', route: '/settings', desc: 'Preferences & sync' },
    { name: 'Component Demo', icon: 'code', component: Ionicons, color: '#8B5CF6', route: '/tamagui-demo', desc: 'Component showcase' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={spacing.xl}>
          <Stack>
            <Text fontSize={32} fontWeight="800" color="#F8FAFC">Sustainability Hub</Text>
            <Text fontSize={14} color="#94A3B8" marginTop={4}>Track. Reduce. Thrive.</Text>
          </Stack>
          <Stack width={56} height={56} borderRadius={28} backgroundColor="#22C55E" alignItems="center" justifyContent="center">
            <Ionicons name="leaf" size={28} color="#FFFFFF" />
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap={spacing.sm} marginBottom={spacing.xl}>
          <QuickStat label="Carbon" value="187 kg" target="200 kg" progress={94} color="#22C55E" icon={<Ionicons name="leaf" size={20} color="#FFFFFF" />} />
          <QuickStat label="Energy" value="423 kWh" target="400 kWh" progress={106} color="#F59E0B" icon={<Ionicons name="flash" size={20} color="#FFFFFF" />} />
          <QuickStat label="Waste" value="4.2 kg" target="3.5 kg" progress={120} color="#EF4444" icon={<Ionicons name="restaurant" size={20} color="#FFFFFF" />} />
        </Stack>

        <Text fontSize={20} fontWeight="700" color="#F8FAFC" marginBottom={spacing.md}>Features</Text>
        <Stack gap={spacing.md} marginBottom={spacing.xl}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </Stack>

        <Card variant="elevated" padding={16} style={styles.ctaCard}>
          <Stack alignItems="center" gap={spacing.md}>
            <Text fontSize={20} fontWeight="700" color="#F8FAFC" textAlign="center">Ready to start?</Text>
            <Text fontSize={14} color="#94A3B8" textAlign="center">Your sustainability journey begins with one scan</Text>
            <Button variant="primary" size="lg" fullWidth onPress={() => router.push('/carbon')}>
              Scan First Receipt
            </Button>
          </Stack>
        </Card>

        <Text fontSize={12} color="#94A3B8" textAlign="center" marginTop={spacing.lg}>Built with Expo + FastAPI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickStat = ({ label, value, target, progress, color, icon }: any) => (
  <Stack flex={1} style={styles.quickStat}>
    <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={spacing.xs}>
      <Stack flexDirection="row" alignItems="center" gap={spacing.xs}>
        <Stack width={28} height={28} borderRadius={8} backgroundColor={color + '33'} alignItems="center" justifyContent="center">
          {icon}
        </Stack>
        <Text fontSize={12} fontWeight="600" color="#F8FAFC">{label}</Text>
      </Stack>
      <Badge variant={progress > 100 ? 'error' : 'success'}>{progress > 100 ? 'Over' : 'On Track'}</Badge>
    </Stack>
    <Text fontSize={20} fontWeight="800" color="#F8FAFC">{value}</Text>
    <Text fontSize={12} color="#94A3B8">Target: {target}</Text>
    <ProgressBar progress={Math.min(100, progress)} color={progress > 100 ? '#EF4444' : '#22C55E'} style={{ marginTop: spacing.xs }} />
  </Stack>
);

const FeatureCard = ({ feature }: any) => (
  <TouchableOpacity style={styles.featureCard} onPress={() => router.push(feature.route)}>
    <Stack flexDirection="row" alignItems="center" gap={spacing.md} padding={spacing.md}>
      <Stack width={48} height={48} borderRadius={12} backgroundColor={feature.color + '33'} alignItems="center" justifyContent="center">
        <feature.component name={feature.icon} size={24} color={feature.color} />
      </Stack>
      <Stack flex={1} gap={spacing.xs}>
        <Text fontSize={16} fontWeight="600" color="#F8FAFC">{feature.name}</Text>
        <Text fontSize={12} color="#94A3B8">{feature.desc}</Text>
      </Stack>
      <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
    </Stack>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { paddingHorizontal: 16, paddingBottom: 48 },
  quickStat: { padding: 16, borderRadius: 12, backgroundColor: '#1E2D4D' },
  featureCard: { borderRadius: 12, overflow: 'hidden' },
  ctaCard: { marginTop: 16 },
});
