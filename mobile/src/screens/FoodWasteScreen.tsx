// mobile/src/screens/FoodWasteScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { Card, Button, Badge, ProgressBar, PieChart, BarChart } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { formatWeight, formatCurrency, formatDate, formatPercentage, getMealColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export const FoodWasteScreen: React.FC = () => {
  const { logs, streak, summary, isLoading, isAnalyzing, analysisProgress, fetchLogs, fetchStreak, logWaste } = useFoodWaste();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchStreak()]);
    setRefreshing(false);
  };

  const handleLogPress = async () => {
    router.push('/food-waste/log');
  };

  const handleZeroWastePress = async () => {
    Alert.alert(
      'Zero Waste Meal! 🎉',
      'Log a meal with zero waste to continue your streak.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Zero Waste',
          onPress: () => router.push('/food-waste/log?zeroWaste=true'),
        },
      ]
    );
  };

  const totalWaste = logs.reduce((sum, l) => sum + l.avoidable_waste_kg + l.unavoidable_waste_kg, 0);
  const avoidableWaste = logs.reduce((sum, l) => sum + l.avoidable_waste_kg, 0);
  const wasteCost = logs.reduce((sum, l) => sum + l.cost_usd, 0);

  const wasteByCategory = summary?.by_category || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍽️ Food Waste Tracker</Text>
          <Text style={styles.subtitle}>Reduce waste, save money</Text>
        </View>
      </View>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <View style={styles.streakContent}>
          <View style={styles.streakMain}>
            <View style={styles.streakIcon}>
              <Entypo name="flame" size={32} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.streakNumber}>{streak?.current_streak_days || 0}</Text>
              <Text style={styles.streakLabel}>Day Streak 🔥</Text>
            </View>
          </View>
          <View style={styles.streakStats}>
            <StatItem label="Best" value={`${streak?.longest_streak_days || 0} days`} />
            <StatItem label="Saved" value={formatWeight(streak?.total_waste_avoided_kg || 0)} />
            <StatItem label="Money" value={formatCurrency(streak?.total_money_saved_usd || 0)} />
          </View>
        </View>
        <View style={styles.streakActions}>
          <Button title="Log Meal" onPress={handleLogPress} variant="primary" fullWidth />
          <Button title="Zero Waste Today" onPress={handleZeroWastePress} variant="outline" fullWidth />
        </View>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard
          title="This Week"
          value={formatWeight(avoidableWaste)}
          subtitle={`${formatCurrency(wasteCost)} wasted`}
          icon={<Ionicons name="trash-outline" size={24} color={colors.error} />}
          bgColor="rgba(239, 68, 68, 0.15)"
        />
        <SummaryCard
          title="Meals Logged"
          value={`${logs.length}`}
          subtitle={logs.length > 0 ? `${Math.round((logs.filter(l => l.avoidable_waste_kg === 0).length / logs.length) * 100)}% zero waste` : 'Start logging'}
          icon={<Ionicons name="restaurant-outline" size={24} color={colors.primary[500]} />}
          bgColor="rgba(34, 197, 94, 0.15)"
        />
        <SummaryCard
          title="Weekly Target"
          value={formatWeight(3.5 / 4)} // weekly target
          subtitle={`${Math.min(100, (avoidableWaste / (3.5 / 4)) * 100).toFixed(0)}% used`}
          icon={<Ionicons name="target-outline" size={24} color={colors.warning} />}
          bgColor="rgba(245, 158, 11, 0.15)"
        />
      </View>

      {/* Waste Breakdown Charts */}
      <View style={styles.chartsRow}>
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Waste by Meal</Text>
          <PieChart
            data={[
              { label: 'Breakfast', value: logs.filter(l => l.meal_type === 'breakfast').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('breakfast') },
              { label: 'Lunch', value: logs.filter(l => l.meal_type === 'lunch').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('lunch') },
              { label: 'Dinner', value: logs.filter(l => l.meal_type === 'dinner').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('dinner') },
              { label: 'Snack', value: logs.filter(l => l.meal_type === 'snack').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('snack') },
            ].filter(d => d.value > 0)}
            size={140}
            innerRadius={50}
            showLegend={false}
          />
        </Card>
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Waste Trend</Text>
          <BarChart
            data={generateWeeklyTrendData(logs)}
            width={160}
            height={120}
            showLabels={true}
            barWidth={16}
            barGap={8}
          />
        </Card>
      </View>

      {/* Logs List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Meals</Text>
      </View>

      {logs.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="restaurant-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No meals logged yet</Text>
          <Text style={styles.emptySubtitle}>Start tracking your food waste today</Text>
          <Button title="Log First Meal" onPress={handleLogPress} style={styles.emptyButton} />
        </Card>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogCard log={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <Card style={styles.analyzingCard}>
          <View style={styles.analyzingContent}>
            <Ionicons name="sync" size={32} color={colors.primary[500]} />
            <View style={styles.analyzingText}>
              <Text style={styles.analyzingTitle}>Analyzing Photos...</Text>
              <Text style={styles.analyzingSubtitle}>
                {analysisProgress > 0 ? `${analysisProgress}% complete` : 'Identifying food & waste'}
              </Text>
            </View>
            <ProgressBar progress={analysisProgress} variant="primary" size="md" />
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, subtitle, icon, bgColor }) => (
  <TouchableOpacity style={[styles.summaryCard, { backgroundColor: bgColor }]}>
    <View style={styles.summaryIcon}>{icon}</View>
    <View>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const LogCard: React.FC<{ log: any }> = ({ log }) => (
  <TouchableOpacity style={styles.logCard} onPress={() => router.push(`/food-waste/log/${log.id}`)}>
    <View style={styles.logMain}>
      <View style={[styles.mealBadge, { backgroundColor: getMealColor(log.meal_type) }]}>
        <Text style={styles.mealBadgeText}>{log.meal_type.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.logInfo}>
        <View style={styles.logHeader}>
          <Text style={styles.logMealType}>{log.meal_type.charAt(0).toUpperCase() + log.meal_type.slice(1)}</Text>
          <Text style={styles.logDate}>{formatDate(log.logged_at)}</Text>
        </View>
        <View style={styles.logMeta}>
          <View style={[styles.logMetric, { borderRightColor: colors.border.light }]}>
            <Text style={styles.logMetricValue}>{formatWeight(log.avoidable_waste_kg + log.unavoidable_waste_kg)}</Text>
            <Text style={styles.logMetricLabel}>Total</Text>
          </View>
          <View style={styles.logMetric}>
            <Text style={styles.logMetricValue}>{formatWeight(log.avoidable_waste_kg)}</Text>
            <Text style={styles.logMetricLabel}>Avoidable</Text>
          </View>
          <View style={styles.logMetric}>
            <Text style={styles.logMetricValue}>{formatCurrency(log.cost_usd)}</Text>
            <Text style={styles.logMetricLabel}>Cost</Text>
          </View>
        </View>
      </View>
      <View style={styles.logWasteRate}>
        <Text style={styles.wasteRateValue}>{formatPercentage(log.avoidable_waste_kg, log.avoidable_waste_kg + log.unavoidable_waste_kg)}</Text>
        <Text style={styles.wasteRateLabel}>Waste Rate</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const generateWeeklyTrendData = (logs: any[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    label: day,
    value: Math.random() * 0.5, // Mock data - replace with real aggregation
    color: colors.primary[500],
  }));
};

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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  streakCard: {
    backgroundColor: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  },
  streakContent: {
    gap: spacing.lg,
  },
  streakMain: {
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
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  streakActions: {
    gap: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
    marginTop: spacing.xs,
  },
  summarySubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  chartsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chartCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  analyzingCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: colors.primary[500],
    borderWidth: 1,
  },
  analyzingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  analyzingText: {
    flex: 1,
  },
  analyzingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  analyzingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  logCard: {
    padding: spacing.md,
  },
  logMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mealBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealBadgeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  logInfo: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  logMealType: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  logDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  logMeta: {
    flexDirection: 'row',
  },
  logMetric: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRightWidth: 1,
  },
  logMetricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  logMetricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  logWasteRate: {
    alignItems: 'flex-end',
  },
  wasteRateValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  wasteRateLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
});