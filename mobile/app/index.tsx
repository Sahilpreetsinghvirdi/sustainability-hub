// mobile/app/index.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, Button, Card, Badge, ProgressBar } from '@/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const features = [
    { name: 'Dashboard', icon: 'analytics', component: MaterialIcons, color: '#0EA5E9', route: '/dashboard', desc: 'Unified sustainability view' },
    { name: 'Carbon Tracker', icon: 'leaf', component: Ionicons, color: '#22C55E', route: '/carbon', desc: 'Receipt scanning & footprint' },
    { name: 'Energy Monitor', icon: 'flash', component: Ionicons, color: '#F59E0B', route: '/energy', desc: 'Bills & appliance audit' },
    { name: 'Food Waste', icon: 'restaurant', component: Ionicons, color: '#EF4444', route: '/food-waste', desc: 'Meal logging & streaks' },
    { name: 'Settings', icon: 'settings', component: Ionicons, color: '#64748B', route: '/settings', desc: 'Preferences & sync' },
    { name: 'Tamagui Demo', icon: 'code', component: Ionicons, color: '#8B5CF6', route: '/tamagui-demo', desc: 'Component showcase' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={spacing.xl}>
          <Stack>
            <Text fontSize="$8" fontWeight="800" color="$color">Sustainability Hub</Text>
            <Text fontSize="$3" color="$colorFocus" marginTop="$1">Track. Reduce. Thrive. 🌱</Text>
          </Stack>
          <Stack width={56} height={56} borderRadius="$full" backgroundColor="$primary" alignItems="center" justifyContent="center">
            <Ionicons name="leaf" size={28} color="$primaryText" />
          </Stack>
        </Stack>

        {/* Quick Stats */}
        <Stack flexDirection="row" gap={spacing.sm} marginBottom={spacing.xl}>
          <QuickStat label="Carbon" value="187 kg" target="200 kg" progress={94} color="$primary" icon={<Ionicons name="leaf" size={20} />} />
          <QuickStat label="Energy" value="423 kWh" target="400 kWh" progress={106} color="$warning" icon={<Ionicons name="flash" size={20} />} />
          <QuickStat label="Waste" value="4.2 kg" target="3.5 kg" progress={120} color="$error" icon={<Ionicons name="restaurant" size={20} />} />
        </Stack>

        {/* Features Grid */}
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom={spacing.md}>Features</Text>
        <Stack gap={spacing.md} marginBottom={spacing.xl}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </Stack>

        {/* CTA */}
        <Card variant="elevated" padding="lg" style={styles.ctaCard}>
          <Stack alignItems="center" gap={spacing.md}>
            <Text fontSize="$5" fontWeight="700" color="$color" textAlign="center">Ready to start?</Text>
            <Text fontSize="$3" color="$colorFocus" textAlign="center">Your sustainability journey begins with one scan</Text>
            <Button variant="primary" size="lg" fullWidth onPress={() => router.push('/carbon')}>
              <Ionicons name="camera" size={20} color="$primaryText" style={{ marginRight: spacing.sm }} />
              Scan First Receipt
            </Button>
          </Stack>
        </Card>

        <Text fontSize="$2" color="$colorFocus" textAlign="center" marginTop={spacing.lg}>Built with Tamagui + Expo + FastAPI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickStat = ({ label, value, target, progress, color, icon }: any) => (
  <Stack flex={1} style={styles.quickStat}>
    <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={spacing.xs}>
      <Stack flexDirection="row" alignItems="center" gap={spacing.xs}>
        <Stack width={28} height={28} borderRadius="$md" backgroundColor={color + '20'} alignItems="center" justifyContent="center">
          {icon}
        </Stack>
        <Text fontSize="$2" fontWeight="600" color="$color">{label}</Text>
      </Stack>
      <Badge variant={progress > 100 ? 'danger' : 'success'} size="xs">{progress > 100 ? 'Over' : 'On Track'}</Badge>
    </Stack>
    <Text fontSize="$5" fontWeight="800" color="$color">{value}</Text>
    <Text fontSize="$1" color="$colorFocus">Target: {target}</Text>
    <ProgressBar progress={Math.min(100, progress)} variant={progress > 100 ? 'danger' : progress > 80 ? 'warning' : 'success'} size="sm" style={{ marginTop: spacing.xs }} />
  </Stack>
);

const FeatureCard = ({ feature }: any) => (
  <TouchableOpacity style={styles.featureCard} onPress={() => router.push(feature.route)}>
    <Stack style={styles.featureCardContent}>
      <Stack width={48} height={48} borderRadius="$lg" backgroundColor={feature.color + '20'} alignItems="center" justifyContent="center">
        <feature.component name={feature.icon} size={24} color={feature.color} />
      </Stack>
      <Stack flex={1} style={styles.featureInfo}>
        <Text fontSize="$4" fontWeight="600" color="$color">{feature.name}</Text>
        <Text fontSize="$2" color="$colorFocus">{feature.desc}</Text>
      </Stack>
      <Ionicons name="chevron-forward" size={24} color="$colorFocus" />
    </Stack>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  quickStat: { padding: spacing.md, borderRadius: '$lg', backgroundColor: '$backgroundStrong' },
  featureCard: { borderRadius: '$lg', overflow: 'hidden' },
  featureCardContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  featureInfo: { gap: spacing.xs },
  ctaCard: { marginTop: spacing.md },
});