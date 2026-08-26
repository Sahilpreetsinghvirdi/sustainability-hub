import React from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDashboard } from '@/hooks/useDashboard';
import { useCarbon } from '@/hooks/useCarbon';
import { useEnergy } from '@/hooks/useEnergy';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { Card, Badge, ProgressBar, SparklineChart } from '@/components';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { formatCarbon, formatEnergy, formatPercentage, formatTrend, formatWeight, getCategoryColor } from '@/utils/formatters';

export const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { summary, insights, achievements, isLoading, refresh } = useDashboard('month');
  const { getTotalCarbonThisMonth } = useCarbon();
  const { getTotalEnergyThisMonth } = useEnergy();
  const { getAvoidableWasteThisWeek, getCurrentStreak } = useFoodWaste();

  const totalCarbon = getTotalCarbonThisMonth();
  const totalEnergy = getTotalEnergyThisMonth();
  const avoidableWaste = getAvoidableWasteThisWeek();
  const streak = getCurrentStreak();
  const carbonBudget = 200;
  const energyTarget = 400;
  const wasteTarget = 3.5;
  const annualFootprint = totalCarbon * 12;
  const footprintProgress = Math.min(100, (annualFootprint / 2000) * 100);
  const trendWidth = Math.max(120, Math.min(190, width - 190));

  if (isLoading) return <DashboardSkeleton />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary[400]} />}
    >
      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.logoMark}><Ionicons name="leaf" size={16} color={colors.background.primary} /></View>
          <Text style={styles.eyebrow}>SUSTAINABILITY HUB</Text>
        </View>
        <Pressable style={styles.notificationButton} onPress={() => Alert.alert('Notifications', 'No new notifications')}>
          <Ionicons name="notifications-outline" size={21} color={colors.text.primary} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Your impact, in motion.</Text>
        <Text style={styles.subtitle}>A clearer view of the choices adding up this month.</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroKicker}>PROJECTED ANNUAL FOOTPRINT</Text>
            <Text style={styles.heroValue}>{formatCarbon(annualFootprint)}</Text>
          </View>
          <View style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>{Math.max(0, Math.round(100 - footprintProgress))}</Text>
            <Text style={styles.heroScoreLabel}>score</Text>
          </View>
        </View>
        <View style={styles.heroProgressRow}>
          <ProgressBar
            progress={footprintProgress}
            variant={footprintProgress > 80 ? 'danger' : footprintProgress > 60 ? 'warning' : 'success'}
            size="sm"
            style={styles.heroProgress}
          />
          <Badge variant={footprintProgress > 80 ? 'danger' : 'success'} size="sm">
            {footprintProgress > 80 ? 'Needs attention' : 'On track'}
          </Badge>
        </View>
        <Text style={styles.heroFootnote}>Target is less than 2.0 t CO₂e per year</Text>
      </View>

      <SectionHeading title="Monthly pulse" action="View details" onPress={() => router.push('/dashboard')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricRail}>
        <MetricCard title="Carbon" value={formatCarbon(totalCarbon)} target={`${formatCarbon(carbonBudget)} budget`} progress={(totalCarbon / carbonBudget) * 100} trend={formatTrend(totalCarbon, carbonBudget * 0.083)} color={colors.primary[400]} icon="leaf-outline" />
        <MetricCard title="Energy" value={formatEnergy(totalEnergy)} target={`${energyTarget} kWh target`} progress={(totalEnergy / energyTarget) * 100} trend={formatTrend(totalEnergy, energyTarget * 0.083)} color={colors.warning} icon="flash-outline" />
        <MetricCard title="Food waste" value={formatWeight(avoidableWaste)} target={`${formatWeight(wasteTarget)} weekly target`} progress={(avoidableWaste / (wasteTarget / 4)) * 100} trend={formatTrend(avoidableWaste, wasteTarget / 4)} color={colors.error} icon="restaurant-outline" />
      </ScrollView>

      <Card style={styles.focusCard}>
        <View style={styles.focusIcon}><Ionicons name="sparkles-outline" size={20} color={colors.warning} /></View>
        <View style={styles.focusCopy}>
          <Text style={styles.cardEyebrow}>YOUR NEXT BEST MOVE</Text>
          <Text style={styles.focusTitle}>{insights[0]?.message || 'Log one small habit today to keep your momentum.'}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.primary[400]} />
      </Card>

      {summary?.carbon && (
        <Card>
          <SectionHeading title="Where your carbon comes from" action="See all" onPress={() => router.push('/carbon')} />
          <View style={styles.categoryList}>
            {Object.entries(summary.carbon.by_category)
              .filter(([, value]) => value > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([category, value]) => (
                <CategoryRow
                  key={category}
                  label={category.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}
                  value={formatCarbon(value)}
                  percentage={formatPercentage(value, totalCarbon)}
                  color={getCategoryColor(category)}
                />
              ))}
          </View>
        </Card>
      )}

      <Card>
        <SectionHeading title="30-day movement" />
        <TrendRow title="Carbon" value={formatCarbon(totalCarbon)} color={colors.primary[400]} data={generateTrendData(totalCarbon / 30)} width={trendWidth} icon="leaf-outline" />
        <TrendRow title="Energy" value={formatEnergy(totalEnergy)} color={colors.warning} data={generateTrendData(totalEnergy / 30)} width={trendWidth} icon="flash-outline" />
        <TrendRow title="Food waste" value={formatWeight(avoidableWaste)} color={colors.error} data={generateTrendData(avoidableWaste / 7)} width={trendWidth} icon="restaurant-outline" last />
      </Card>

      {achievements.length > 0 && (
        <Card>
          <SectionHeading title="Small wins" action="See all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementRail}>
            {achievements.slice(0, 5).map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon || '✦'}</Text>
                <Text style={styles.achievementName}>{achievement.name || achievement}</Text>
              </View>
            ))}
          </ScrollView>
        </Card>
      )}

      <View style={styles.streakCard}>
        <View style={styles.streakIcon}><Ionicons name="flame" size={23} color={colors.background.primary} /></View>
        <View style={styles.streakCopy}>
          <Text style={styles.streakKicker}>KEEP IT GOING</Text>
          <Text style={styles.streakValue}>{streak} day zero-waste streak</Text>
        </View>
        <Pressable style={styles.streakButton} onPress={() => router.push('/food-waste/log')}>
          <Text style={styles.streakButtonText}>Log meal</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.background.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
};

const SectionHeading = ({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable>}
  </View>
);

const MetricCard = ({ title, value, target, progress, trend, color, icon }: { title: string; value: string; target: string; progress: number; trend: { value: string; isPositive: boolean }; color: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.metricCard}>
    <View style={styles.metricTopRow}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={18} color={color} /></View>
      <Badge variant={trend.isPositive ? 'success' : 'danger'} size="sm">{trend.value}</Badge>
    </View>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <ProgressBar progress={progress} variant={progress > 90 ? 'danger' : progress > 70 ? 'warning' : 'success'} size="sm" />
    <Text style={styles.metricTarget}>{target}</Text>
  </View>
);

const CategoryRow = ({ label, value, percentage, color }: { label: string; value: string; percentage: string; color: string }) => (
  <View style={styles.categoryRow}>
    <View style={[styles.categoryDot, { backgroundColor: color }]} />
    <View style={styles.categoryCopy}><Text style={styles.categoryLabel}>{label}</Text><Text style={styles.categoryPercentage}>{percentage}</Text></View>
    <Text style={styles.categoryValue}>{value}</Text>
  </View>
);

const TrendRow = ({ title, value, color, data, width, icon, last = false }: { title: string; value: string; color: string; data: number[]; width: number; icon: keyof typeof Ionicons.glyphMap; last?: boolean }) => (
  <View style={[styles.trendRow, !last && styles.trendRowBorder]}>
    <View style={[styles.trendIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={16} color={color} /></View>
    <View style={styles.trendCopy}><Text style={styles.trendTitle}>{title}</Text><Text style={styles.trendValue}>{value}</Text></View>
    <SparklineChart data={data} color={color} width={width} height={38} strokeWidth={2.5} fillOpacity={0.15} />
  </View>
);

const generateTrendData = (base: number) => Array.from({ length: 18 }, (_, index) => Math.max(0, base * (0.75 + ((index * 17) % 9) / 20)));

const DashboardSkeleton = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.skeletonHeader}><View style={styles.skeletonSmall} /><View style={styles.skeletonCircle} /></View>
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonHero} />
    <View style={styles.skeletonMetricRail}><View style={styles.skeletonMetric} /><View style={styles.skeletonMetric} /></View>
    <View style={styles.skeletonBlock} /><View style={styles.skeletonBlock} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 118, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoMark: { width: 30, height: 30, borderRadius: borderRadius.sm, backgroundColor: colors.primary[400], alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text.tertiary },
  notificationButton: { width: 42, height: 42, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning },
  titleBlock: { gap: spacing.xs },
  title: { color: colors.text.primary, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: colors.text.tertiary, fontSize: 15, lineHeight: 22, maxWidth: 310 },
  heroCard: { minHeight: 196, overflow: 'hidden', borderRadius: borderRadius.xl, padding: spacing.lg, backgroundColor: colors.primary[800], ...shadows.lg },
  heroOrbLarge: { position: 'absolute', width: 210, height: 210, borderRadius: 105, right: -82, top: -82, backgroundColor: 'rgba(87,197,138,0.16)' },
  heroOrbSmall: { position: 'absolute', width: 96, height: 96, borderRadius: 48, right: 46, bottom: -52, backgroundColor: 'rgba(242,184,91,0.13)' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroKicker: { color: colors.primary[200], fontSize: 10, fontWeight: '700', letterSpacing: 1.25 },
  heroValue: { color: colors.neutral[0], fontSize: 36, lineHeight: 44, fontWeight: '800', marginTop: spacing.xs },
  heroScore: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.12)' },
  heroScoreValue: { color: colors.neutral[0], fontSize: 20, fontWeight: '800', lineHeight: 22 },
  heroScoreLabel: { color: colors.primary[200], fontSize: 10, fontWeight: '600' },
  heroProgressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  heroProgress: { flex: 1 },
  heroFootnote: { color: colors.primary[200], fontSize: 12, marginTop: spacing.sm },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  sectionAction: { color: colors.primary[400], fontSize: 13, fontWeight: '700' },
  metricRail: { gap: spacing.sm, paddingRight: spacing.md },
  metricCard: { width: 174, padding: spacing.md, backgroundColor: colors.background.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border.light, gap: spacing.sm },
  metricTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricIcon: { width: 34, height: 34, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  metricTitle: { color: colors.text.tertiary, fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
  metricValue: { color: colors.text.primary, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  metricTarget: { color: colors.text.tertiary, fontSize: 11, marginTop: -2 },
  focusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background.secondary, borderColor: colors.border.medium },
  focusIcon: { width: 38, height: 38, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(242,184,91,0.14)' },
  focusCopy: { flex: 1, gap: 3 },
  cardEyebrow: { color: colors.warning, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  focusTitle: { color: colors.text.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  categoryList: { gap: spacing.md },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryCopy: { flex: 1, gap: 2 },
  categoryLabel: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  categoryPercentage: { color: colors.text.tertiary, fontSize: 12 },
  categoryValue: { color: colors.text.primary, fontSize: 14, fontWeight: '700' },
  trendRow: { flexDirection: 'row', alignItems: 'center', minHeight: 62, gap: spacing.sm },
  trendRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.light },
  trendIcon: { width: 32, height: 32, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  trendCopy: { width: 80, gap: 2 },
  trendTitle: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },
  trendValue: { color: colors.text.tertiary, fontSize: 11 },
  achievementRail: { gap: spacing.sm, paddingRight: spacing.md },
  achievementItem: { width: 102, minHeight: 86, padding: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  achievementIcon: { fontSize: 24 },
  achievementName: { color: colors.text.secondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.warning },
  streakIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,26,20,0.16)' },
  streakCopy: { flex: 1, gap: 2 },
  streakKicker: { color: 'rgba(8,26,20,0.65)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  streakValue: { color: colors.background.primary, fontSize: 15, lineHeight: 20, fontWeight: '800' },
  streakButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.neutral[0] },
  streakButtonText: { color: colors.background.primary, fontSize: 12, fontWeight: '800' },
  skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonSmall: { width: 150, height: 24, borderRadius: borderRadius.sm, backgroundColor: colors.background.tertiary },
  skeletonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.background.tertiary },
  skeletonTitle: { width: '74%', height: 34, borderRadius: borderRadius.sm, backgroundColor: colors.background.tertiary },
  skeletonHero: { height: 196, borderRadius: borderRadius.xl, backgroundColor: colors.background.tertiary },
  skeletonMetricRail: { flexDirection: 'row', gap: spacing.sm },
  skeletonMetric: { width: 174, height: 170, borderRadius: borderRadius.lg, backgroundColor: colors.background.tertiary },
  skeletonBlock: { height: 150, borderRadius: borderRadius.lg, backgroundColor: colors.background.tertiary },
});