import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useCarbon } from '@/hooks/useCarbon';
import { useEnergy } from '@/hooks/useEnergy';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { borderRadius, colors, shadows, spacing } from '@/constants/theme';
import { formatCarbon, formatEnergy, formatWeight } from '@/utils/formatters';

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const carbon = useCarbon();
  const energy = useEnergy();
  const foodWaste = useFoodWaste();
  const firstName = user?.name?.trim().split(' ')[0] || 'there';
  const totalCarbon = carbon.getTotalCarbonThisMonth();
  const totalEnergy = energy.getTotalEnergyThisMonth();
  const totalWaste = foodWaste.getAvoidableWasteThisWeek();
  const streak = foodWaste.getCurrentStreak();
  const impactScore = useMemo(() => Math.max(0, Math.round(100 - Math.min(100, (totalCarbon / 200) * 100))), [totalCarbon]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([carbon.refresh(), energy.refresh(), foodWaste.refresh()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[400]} />}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}><Ionicons name="leaf" size={17} color={colors.background.primary} /></View>
            <View><Text style={styles.brandName}>Sustainability</Text><Text style={styles.brandCaption}>HUB / PERSONAL</Text></View>
          </View>
          <Pressable style={styles.profileButton} onPress={() => router.push('/settings')}>
            <Text style={styles.profileInitial}>{firstName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Good morning, {firstName}.</Text>
          <Text style={styles.subtitle}>One small choice can shift the whole picture.</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>YOUR MONTHLY PULSE</Text>
            <Text style={styles.heroTitle}>Make your impact visible.</Text>
            <Text style={styles.heroBody}>You have logged {carbon.scans.length} carbon {carbon.scans.length === 1 ? 'entry' : 'entries'} this month.</Text>
            <Pressable style={styles.heroButton} onPress={() => router.push('/dashboard')}>
              <Text style={styles.heroButtonText}>Open dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.background.primary} />
            </Pressable>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{impactScore}</Text>
            <Text style={styles.scoreLabel}>impact{`\n`}score</Text>
          </View>
          <View style={styles.heroLeafOne} /><View style={styles.heroLeafTwo} />
        </View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Your pulse</Text><Text style={styles.sectionMeta}>THIS MONTH</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricRail}>
          <MetricTile label="Carbon" value={formatCarbon(totalCarbon)} detail="of 200 kg budget" color={colors.primary[400]} icon="leaf-outline" />
          <MetricTile label="Energy" value={formatEnergy(totalEnergy)} detail="of 400 kWh target" color={colors.warning} icon="flash-outline" />
          <MetricTile label="Food waste" value={formatWeight(totalWaste)} detail="avoidable this week" color={colors.error} icon="restaurant-outline" />
        </ScrollView>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Add a habit</Text><Text style={styles.sectionMeta}>QUICK ACTIONS</Text></View>
        <View style={styles.actionGrid}>
          <ActionTile title="Scan waste" subtitle="AI analyzer" icon="scan-outline" color={colors.error} route="/ai-tools/waste" />
          <ActionTile title="Add receipt" subtitle="Track carbon" icon="receipt-outline" color={colors.primary[400]} route="/carbon" />
          <ActionTile title="Log a meal" subtitle="Reduce waste" icon="restaurant-outline" color={colors.warning} route="/food-waste/log" />
          <ActionTile title="Run an audit" subtitle="Save energy" icon="flash-outline" color={colors.secondary[400]} route="/energy/audit" />
        </View>

        <Pressable style={styles.streakCard} onPress={() => router.push('/food-waste')}>
          <View style={styles.streakIcon}><Ionicons name="flame" size={20} color={colors.background.primary} /></View>
          <View style={styles.streakCopy}><Text style={styles.streakKicker}>ZERO-WASTE STREAK</Text><Text style={styles.streakTitle}>{streak} days and counting</Text></View>
          <Ionicons name="chevron-forward" size={20} color={colors.warning} />
        </Pressable>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Keep exploring</Text><Text style={styles.sectionMeta}>TOOLS</Text></View>
        <View style={styles.toolList}>
          <ToolRow title="Full impact dashboard" subtitle="Trends, categories and wins" icon="analytics-outline" color={colors.primary[400]} route="/dashboard" />
          <ToolRow title="Energy monitor" subtitle="Bills, appliances and savings" icon="flash-outline" color={colors.warning} route="/energy" />
          <ToolRow title="AI sustainability tools" subtitle="Waste, plants and agriculture" icon="sparkles-outline" color={colors.secondary[400]} route="/ai-tools" />
        </View>

        <Text style={styles.footer}>Built for better everyday decisions.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

type IconName = keyof typeof Ionicons.glyphMap;

type ActionTileProps = { title: string; subtitle: string; icon: IconName; color: string; route: string };

const ActionTile = ({ title, subtitle, icon, color, route }: ActionTileProps) => (
  <Pressable style={styles.actionTile} onPress={() => router.push(route as never)}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={20} color={color} /></View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
    <Ionicons name="arrow-forward" size={16} color={colors.text.tertiary} style={styles.actionArrow} />
  </Pressable>
);

const MetricTile = ({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: IconName }) => (
  <View style={styles.metricTile}>
    <View style={styles.metricTop}><View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={17} color={color} /></View><View style={[styles.metricStatus, { backgroundColor: color }]} /></View>
    <Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text>
  </View>
);

const ToolRow = ({ title, subtitle, icon, color, route }: { title: string; subtitle: string; icon: IconName; color: string; route: string }) => (
  <Pressable style={styles.toolRow} onPress={() => router.push(route as never)}>
    <View style={[styles.toolIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={19} color={color} /></View>
    <View style={styles.toolCopy}><Text style={styles.toolTitle}>{title}</Text><Text style={styles.toolSubtitle}>{subtitle}</Text></View>
    <Ionicons name="arrow-forward" size={18} color={colors.text.tertiary} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 118, gap: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoMark: { width: 34, height: 34, borderRadius: borderRadius.sm, backgroundColor: colors.primary[400], alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.text.primary, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  brandCaption: { color: colors.text.tertiary, fontSize: 9, fontWeight: '800', letterSpacing: 1.25, marginTop: 2 },
  profileButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.medium },
  profileInitial: { color: colors.primary[300], fontSize: 15, fontWeight: '800' },
  greetingBlock: { gap: spacing.xs, marginTop: spacing.sm },
  greeting: { color: colors.text.primary, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: colors.text.tertiary, fontSize: 15, lineHeight: 22 },
  heroCard: { minHeight: 238, overflow: 'hidden', borderRadius: borderRadius.xl, backgroundColor: colors.primary[800], padding: spacing.lg, ...shadows.lg },
  heroCopy: { maxWidth: '68%', gap: spacing.sm, zIndex: 2 },
  heroKicker: { color: colors.primary[200], fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: colors.neutral[0], fontSize: 25, lineHeight: 31, fontWeight: '800', letterSpacing: -0.4 },
  heroBody: { color: colors.primary[200], fontSize: 13, lineHeight: 19 },
  heroButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, backgroundColor: colors.primary[300], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginTop: spacing.sm },
  heroButtonText: { color: colors.background.primary, fontSize: 12, fontWeight: '800' },
  scoreCircle: { position: 'absolute', right: 18, top: 58, width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(8,26,20,0.18)', zIndex: 2 },
  scoreValue: { color: colors.neutral[0], fontSize: 30, lineHeight: 32, fontWeight: '800' },
  scoreLabel: { color: colors.primary[200], fontSize: 10, lineHeight: 12, fontWeight: '700', textAlign: 'center' },
  heroLeafOne: { position: 'absolute', width: 174, height: 174, borderRadius: 87, right: -58, bottom: -63, borderWidth: 1, borderColor: 'rgba(138,217,170,0.22)' },
  heroLeafTwo: { position: 'absolute', width: 250, height: 250, borderRadius: 125, right: -100, top: -84, borderWidth: 1, borderColor: 'rgba(138,217,170,0.12)' },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: -spacing.sm },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  sectionMeta: { color: colors.text.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  metricRail: { gap: spacing.sm, paddingRight: spacing.md },
  metricTile: { width: 152, minHeight: 132, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light, gap: spacing.xs },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  metricIcon: { width: 32, height: 32, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  metricStatus: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { color: colors.text.tertiary, fontSize: 12, fontWeight: '700' },
  metricValue: { color: colors.text.primary, fontSize: 21, fontWeight: '800', letterSpacing: -0.3 },
  metricDetail: { color: colors.text.tertiary, fontSize: 11, lineHeight: 15 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionTile: { width: '48%', minHeight: 112, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light },
  actionIcon: { width: 34, height: 34, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionTitle: { color: colors.text.primary, fontSize: 14, fontWeight: '800' },
  actionSubtitle: { color: colors.text.tertiary, fontSize: 11, marginTop: 3 },
  actionArrow: { position: 'absolute', top: spacing.md, right: spacing.md },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.medium },
  streakIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.warning },
  streakCopy: { flex: 1, gap: 2 },
  streakKicker: { color: colors.warning, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  streakTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '800' },
  toolList: { gap: spacing.sm },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light },
  toolIcon: { width: 36, height: 36, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  toolCopy: { flex: 1, gap: 3 },
  toolTitle: { color: colors.text.primary, fontSize: 14, fontWeight: '700' },
  toolSubtitle: { color: colors.text.tertiary, fontSize: 12 },
  footer: { color: colors.text.tertiary, textAlign: 'center', fontSize: 12, marginTop: spacing.sm },
});

export default HomeScreen;