// mobile/src/screens/DashboardScreen.tsx
import React from 'react';
import { View, ScrollView, RefreshControl, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDashboard } from '@/hooks/useDashboard';
import { useCarbon } from '@/hooks/useCarbon';
import { useEnergy } from '@/hooks/useEnergy';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { Card, ProgressBar, Badge, SparklineChart } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { formatCurrency, formatCarbon, formatEnergy, formatWeight, formatPercentage, formatTrend, getCategoryColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

export const DashboardScreen: React.FC = () => {
  const { summary, insights, achievements, isLoading, isRefreshing, refresh, loadTrends } = useDashboard('month');
  const { getTotalCarbonThisMonth } = useCarbon();
  const { getTotalEnergyThisMonth, getTotalCostThisMonth } = useEnergy();
  const { getTotalWasteThisWeek, getAvoidableWasteThisWeek, getCurrentStreak } = useFoodWaste();

  const totalCarbon = getTotalCarbonThisMonth();
  const totalEnergy = getTotalEnergyThisMonth();
  const totalCost = getTotalCostThisMonth();
  const totalWaste = getTotalWasteThisWeek();
  const avoidableWaste = getAvoidableWasteThisWeek();
  const streak = getCurrentStreak();

  const carbonBudget = 200; // from preferences
  const energyTarget = 400;
  const wasteTarget = 3.5;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
      }
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 🌱</Text>
          <Text style={styles.subtitle}>Here's your impact this month</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Impact Cards */}
      <View style={styles.cardsGrid}>
        <ImpactCard
          title="Carbon"
          value={formatCarbon(totalCarbon)}
          trend={formatTrend(totalCarbon, carbonBudget * 0.083)} // ~monthly budget / 12
          progress={Math.min(100, (totalCarbon / carbonBudget) * 100)}
          target={`${formatCarbon(carbonBudget)} / month`}
          icon={<Ionicons name="leaf-outline" size={28} color={colors.primary[500]} />}
          iconBg="rgba(34, 197, 94, 0.15)"
          progressColor={colors.primary[500]}
        />
        <ImpactCard
          title="Energy"
          value={`${totalEnergy.toFixed(0)} kWh`}
          trend={formatTrend(totalEnergy, energyTarget * 0.083)}
          progress={Math.min(100, (totalEnergy / energyTarget) * 100)}
          target={`${energyTarget} kWh / month`}
          icon={<Ionicons name="flash-outline" size={28} color={colors.warning} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          progressColor={colors.warning}
        />
        <ImpactCard
          title="Food Waste"
          value={formatWeight(avoidableWaste)}
          trend={formatTrend(avoidableWaste, wasteTarget / 4)}
          progress={Math.min(100, (avoidableWaste / (wasteTarget / 4)) * 100)}
          target={`${formatWeight(wasteTarget)} / month`}
          icon={<Ionicons name="restaurant-outline" size={28} color={colors.error} />}
          iconBg="rgba(239, 68, 68, 0.15)"
          progressColor={colors.error}
        />
      </View>

      {/* Total Footprint */}
      <Card style={styles.totalCard}>
        <View style={styles.totalHeader}>
          <Text style={styles.totalTitle}>🎯 Total Annual Footprint</Text>
          <Badge variant="info" size="sm">Projected</Badge>
        </View>
        <Text style={styles.totalValue}>{formatCarbon(totalCarbon * 12)}</Text>
        <ProgressBar
          progress={Math.min(100, (totalCarbon * 12) / 2000 * 100)}
          variant={totalCarbon * 12 > 2000 ? 'danger' : totalCarbon * 12 > 1600 ? 'warning' : 'success'}
          size="lg"
          showLabel
          label="Target: < 2.0 t CO₂e/year"
        />
      </Card>

      {/* Carbon Breakdown */}
      {summary?.carbon && (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🛒 Carbon by Category</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryList}>
            {Object.entries(summary.carbon.by_category)
              .filter(([, value]) => value > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, value]) => (
                <CategoryRow
                  key={category}
                  label={category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={formatCarbon(value)}
                  percentage={formatPercentage(value, totalCarbon)}
                  color={getCategoryColor(category)}
                />
              ))}
          </View>
        </Card>
      )}

      {/* Trends */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 30-Day Trends</Text>
        </View>
        <View style={styles.trendsRow}>
          <TrendChart
            title="Carbon"
            data={generateMockTrendData(30, totalCarbon / 30)}
            color={colors.primary[500]}
          />
          <TrendChart
            title="Energy"
            data={generateMockTrendData(30, totalEnergy / 30)}
            color={colors.warning}
          />
          <TrendChart
            title="Waste"
            data={generateMockTrendData(30, avoidableWaste / 7)}
            color={colors.error}
          />
        </View>
      </Card>

      {/* Smart Suggestions */}
      {insights.length > 0 && (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 Smart Suggestions</Text>
          </View>
          <View style={styles.insightsList}>
            {insights.slice(0, 3).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          </View>
          <View style={styles.achievementsRow}>
            {achievements.slice(0, 5).map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} />
            ))}
          </View>
        </Card>
      )}

      {/* Streak */}
      <Card style={styles.streakCard}>
        <View style={styles.streakContent}>
          <View style={styles.streakIcon}>
            <Entypo name="flame" size={32} color={colors.warning} />
          </View>
          <View>
            <Text style={styles.streakNumber}>{streak} Days</Text>
            <Text style={styles.streakLabel}>Current Zero-Waste Streak</Text>
          </View>
          <TouchableOpacity style={styles.streakButton}>
            <Text style={styles.streakButtonText}>Log Meal</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

// Sub-components
const ImpactCard: React.FC<{
  title: string;
  value: string;
  trend: { value: string; isPositive: boolean };
  progress: number;
  target: string;
  icon: React.ReactNode;
  iconBg: string;
  progressColor: string;
}> = ({ title, value, trend, progress, target, icon, iconBg, progressColor }) => (
  <Card style={styles.impactCard}>
    <View style={styles.impactHeader}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>{icon}</View>
      <Badge variant={trend.isPositive ? 'success' : 'danger'} size="sm">
        {trend.value}
      </Badge>
    </View>
    <Text style={styles.impactValue}>{value}</Text>
    <Text style={styles.impactLabel}>{title}</Text>
    <ProgressBar
      progress={progress}
      variant={progress > 90 ? 'danger' : progress > 70 ? 'warning' : 'success'}
      size="sm"
    />
    <Text style={styles.impactTarget}>{target}</Text>
  </Card>
);

const CategoryRow: React.FC<{
  label: string;
  value: string;
  percentage: string;
  color: string;
}> = ({ label, value, percentage, color }) => (
  <View style={styles.categoryRow}>
    <View style={[styles.categoryColor, { backgroundColor: color }]} />
    <View style={styles.categoryInfo}>
      <Text style={styles.categoryLabel}>{label}</Text>
      <Text style={styles.categoryPercentage}>{percentage}</Text>
    </View>
    <Text style={styles.categoryValue}>{value}</Text>
  </View>
);

const TrendChart: React.FC<{
  title: string;
  data: number[];
  color: string;
}> = ({ title, data, color }) => (
  <View style={styles.trendChart}>
    <Text style={styles.trendTitle}>{title}</Text>
    <SparklineChart
      data={data}
      color={color}
      width={100}
      height={50}
      strokeWidth={2}
      fillOpacity={0.15}
    />
  </View>
);

const InsightCard: React.FC<{ insight: any }> = ({ insight }) => (
  <View style={styles.insightCard}>
    <Ionicons name="lightbulb-outline" size={20} color={colors.warning} />
    <Text style={styles.insightText}>{insight.message || insight}</Text>
  </View>
);

const AchievementBadge: React.FC<{ achievement: any }> = ({ achievement }) => (
  <View style={styles.achievementBadge}>
    <Text style={styles.achievementIcon}>{achievement.icon || '🏅'}</Text>
    <Text style={styles.achievementName}>{achievement.name || achievement}</Text>
  </View>
);

const DashboardSkeleton: React.FC = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineSmall} />
    </View>
    <View style={styles.cardsGrid}>
      <View style={[styles.impactCard, styles.skeletonCard]} />
      <View style={[styles.impactCard, styles.skeletonCard]} />
      <View style={[styles.impactCard, styles.skeletonCard]} />
    </View>
    <View style={[styles.totalCard, styles.skeletonCard]} />
    <View style={styles.skeletonCard} />
    <View style={styles.skeletonCard} />
    <View style={styles.skeletonCard} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  impactCard: {
    flex: 1,
    minWidth: 0,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  impactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  impactTarget: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  totalCard: {
    marginTop: spacing.md,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryPercentage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  categoryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  trendsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  trendChart: {
    flex: 1,
    alignItems: 'center',
  },
  trendTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  insightsList: {
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  achievementBadge: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  achievementName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  streakButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  streakButtonText: {
    color: colors.neutral[0],
    fontWeight: typography.fontWeight.semibold,
  },
  skeletonLine: {
    height: 28,
    width: '60%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
  skeletonLineSmall: {
    height: 16,
    width: '40%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  skeletonCard: {
    height: 120,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
  },
});