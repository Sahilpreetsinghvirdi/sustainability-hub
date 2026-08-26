// mobile/src/screens/FoodWasteScreen.tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, Text, Button, Card, Badge, ProgressBar, PieChart, BarChart } from '@/ui';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { formatWeight, formatCurrency, formatDate, formatPercentage, getMealColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';

export const FoodWasteScreen: React.FC = () => {
  const { logs, streak, summary, isLoading, isAnalyzing, analysisProgress, fetchLogs, fetchStreak, logWaste } = useFoodWaste();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchStreak()]);
    setRefreshing(false);
  };

  const handleLogPress = () => router.push('/food-waste/log');

  const handleZeroWastePress = () => {
    Alert.alert(
      'Zero Waste Meal! ðŸŽ‰',
      'Log a meal with zero waste to continue your streak.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Zero Waste', onPress: () => router.push('/food-waste/log?zeroWaste=true') },
      ]
    );
  };

  const totalWaste = logs.reduce((sum, l) => sum + l.avoidable_waste_kg + l.unavoidable_waste_kg, 0);
  const avoidableWaste = logs.reduce((sum, l) => sum + l.avoidable_waste_kg, 0);
  const wasteCost = logs.reduce((sum, l) => sum + l.cost_usd, 0);
  const zeroWasteMeals = logs.filter(l => l.avoidable_waste_kg === 0).length;

  const mealData = [
    { label: 'Breakfast', value: logs.filter(l => l.meal_type === 'breakfast').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('breakfast') },
    { label: 'Lunch', value: logs.filter(l => l.meal_type === 'lunch').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('lunch') },
    { label: 'Dinner', value: logs.filter(l => l.meal_type === 'dinner').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('dinner') },
    { label: 'Snack', value: logs.filter(l => l.meal_type === 'snack').reduce((s, l) => s + l.avoidable_waste_kg, 0), color: getMealColor('snack') },
  ].filter(d => d.value > 0);

  const weeklyTrend = generateWeeklyTrendData(logs);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Stack>
          <Stack flexDirection="row" alignItems="center" gap="2" marginBottom="1">
            <Stack width={40} height={40} borderRadius="md" backgroundColor="rgba(239,68,68,0.2)" alignItems="center" justifyContent="center">
              <Ionicons name="restaurant" size={24} color="#EF4444" />
            </Stack>
            <Text fontSize="28" fontWeight="800" color="#F8FAFC">Food Waste</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Streak Card */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.streakCard}>
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="lg">
          <Stack flexDirection="row" alignItems="center" gap="4">
            <Stack width={64} height={64} borderRadius="full" backgroundColor="#F59E0B" alignItems="center" justifyContent="center">
              <Entypo name="flame" size={36} color="#FBBF24" />
            </Stack>
            <Stack>
              <Text fontSize="36" fontWeight="800" color="#F8FAFC">{streak?.current_streak_days || 0}</Text>
              <Text fontSize="12" color="#CBD5E1">Day Streak</Text>
            </Stack>
          </Stack>
          <Stack flexDirection="row" gap="6">
            <StatItem label="Best" value={`${streak?.longest_streak_days || 0}d`} />
            <StatItem label="Saved" value={formatWeight(streak?.total_waste_avoided_kg || 0)} />
            <StatItem label="Money" value={formatCurrency(streak?.total_money_saved_usd || 0)} />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="3">
          <Button variant="primary" flex={1} onPress={handleLogPress}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="add" size={20} />
              <Text>Log Meal</Text>
            </Stack>
          </Button>
          <Button variant="outline" flex={1} onPress={handleZeroWastePress}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Entypo name="star" size={20} />
              <Text>Zero Waste</Text>
            </Stack>
          </Button>
        </Stack>
      </Card>

      {/* Summary Cards */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <SummaryCard
          title="This Week"
          value={formatWeight(avoidableWaste)}
          subtitle={`${formatCurrency(wasteCost)} wasted`}
          icon={<Ionicons name="trash" size={22} />}
          color="#EF4444"
        />
        <SummaryCard
          title="Meals Logged"
          value={`${logs.length}`}
          subtitle={logs.length > 0 ? `${Math.round((zeroWasteMeals / logs.length) * 100)}% zero waste` : 'Start logging'}
          icon={<Ionicons name="restaurant" size={22} />}
          color="#22C55E"
        />
        <SummaryCard
          title="Weekly Target"
          value={formatWeight(3.5 / 4)}
          subtitle={`${Math.min(100, (avoidableWaste / (3.5 / 4)) * 100).toFixed(0)}% used`}
          icon={<Ionicons name="target" size={22} />}
          color="#F59E0B"
        />
      </Stack>

      {/* Charts */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <Card variant="default" padding="lg" flex={1} style={styles.chartCard}>
          <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="lg">Waste by Meal</Text>
          {mealData.length > 0 ? (
            <PieChart data={mealData} size={160} innerRadius={50} showLegend={false} />
          ) : (
            <Stack alignItems="center" justifyContent="center" style={{ height: 160 }}>
              <Ionicons name="restaurant" size={40} color="#CBD5E1" />
              <Text fontSize="8" color="#CBD5E1" marginTop="2" textAlign="center">Log meals to see breakdown</Text>
            </Stack>
          )}
        </Card>
        <Card variant="default" padding="lg" flex={1} style={styles.chartCard}>
          <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="lg">Weekly Trend</Text>
          <BarChart data={weeklyTrend} width={160} height={120} showLabels barWidth={16} barGap={8} />
        </Card>
      </Stack>

      {/* Logs List */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
        <Text fontSize="20" fontWeight="700" color="#F8FAFC">Recent Meals</Text>
      </Stack>

      {logs.length === 0 ? (
        <Card variant="filled" padding="xl" alignItems="center" style={styles.emptyCard}>
          <Ionicons name="restaurant" size={56} color="#CBD5E1" />
          <Text fontSize="20" fontWeight="600" color="#F8FAFC" marginTop="3" marginBottom="1">No meals logged yet</Text>
          <Text fontSize="12" color="#CBD5E1" textAlign="center" marginBottom="4">Start tracking your food waste</Text>
          <Button variant="primary" onPress={handleLogPress}>Log First Meal</Button>
        </Card>
      ) : (
        <Stack gap="2">
          {logs.map((log) => <LogCard key={log.id} log={log} />)}
        </Stack>
      )}

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <Card variant="default" padding="md" marginTop="lg" borderColor="#22C55E" borderWidth={2}>
          <Stack flexDirection="row" alignItems="center" gap="3">
            <Ionicons name="sync" size={28} color="#22C55E" />
            <Stack flex={1}>
              <Text fontSize="16" fontWeight="600" color="#F8FAFC">Analyzing Photos...</Text>
              <Text fontSize="8" color="#CBD5E1">{analysisProgress > 0 ? `${analysisProgress}% complete` : 'Identifying food & waste'}</Text>
            </Stack>
            <ProgressBar progress={analysisProgress} variant="primary" size="md" style={{ width: 100 }} />
          </Stack>
        </Card>
      )}
    </ScrollView>
  );
};

const StatItem = ({ label, value }: any) => (
  <Stack alignItems="center">
    <Text fontSize="12" fontWeight="700" color="#F8FAFC">{value}</Text>
    <Text fontSize="4" color="#CBD5E1">{label}</Text>
  </Stack>
);

const SummaryCard = ({ title, value, subtitle, icon, color }: any) => (
  <Stack flex={1} style={styles.summaryCard}>
    <Stack width={44} height={44} borderRadius="lg" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="8" color="#CBD5E1" textTransform="uppercase" letterSpacing={1}>{title}</Text>
    <Text fontSize="24" fontWeight="800" color="#F8FAFC" marginTop="1">{value}</Text>
    <Text fontSize="4" color="#CBD5E1">{subtitle}</Text>
  </Stack>
);

const LogCard = ({ log }: any) => (
  <Card variant="default" padding="md" style={styles.logCard}>
    <Stack flexDirection="row" alignItems="center" gap="3">
      <Stack width={40} height={40} borderRadius="full" backgroundColor={getMealColor(log.meal_type) + '20'} alignItems="center" justifyContent="center">
        <Text fontSize="12" fontWeight="700" color={getMealColor(log.meal_type)}>{log.meal_type.charAt(0).toUpperCase()}</Text>
      </Stack>
      <Stack flex={1}>
        <Stack flexDirection="row" justifyContent="space-between" marginBottom="2">
          <Text fontSize="12" fontWeight="600" color="#F8FAFC">{log.meal_type.charAt(0).toUpperCase() + log.meal_type.slice(1)}</Text>
          <Text fontSize="4" color="#CBD5E1">{formatDate(log.logged_at)}</Text>
        </Stack>
        <Stack flexDirection="row" gap="4">
          <Stack style={styles.logMetric} borderRightWidth={1} borderRightColor="#334155">
            <Text fontSize="8" fontWeight="600" color="#F8FAFC">{formatWeight(log.avoidable_waste_kg + log.unavoidable_waste_kg)}</Text>
            <Text fontSize="4" color="#CBD5E1">Total</Text>
          </Stack>
          <Stack style={styles.logMetric} borderRightWidth={1} borderRightColor="#334155">
            <Text fontSize="8" fontWeight="600" color="#F8FAFC">{formatWeight(log.avoidable_waste_kg)}</Text>
            <Text fontSize="4" color="#CBD5E1">Avoidable</Text>
          </Stack>
          <Stack style={styles.logMetric}>
            <Text fontSize="8" fontWeight="600" color="#F8FAFC">{formatCurrency(log.cost_usd)}</Text>
            <Text fontSize="4" color="#CBD5E1">Cost</Text>
          </Stack>
        </Stack>
      </Stack>
      <Stack alignItems="flex-end">
        <Text fontSize="16" fontWeight="700" color="#EF4444">{formatPercentage(log.avoidable_waste_kg, log.avoidable_waste_kg + log.unavoidable_waste_kg)}</Text>
        <Text fontSize="4" color="#CBD5E1">Waste Rate</Text>
      </Stack>
    </Stack>
  </Card>
);

const generateWeeklyTrendData = (logs: any[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    label: day,
    value: logs.filter(l => new Date(l.logged_at).getDay() === days.indexOf(day))
      .reduce((s, l) => s + l.avoidable_waste_kg, 0) / Math.max(1, logs.filter(l => new Date(l.logged_at).getDay() === days.indexOf(day)).length) || Math.random() * 0.3,
    color: '#22C55E',
  }));
};

const styles = {
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  streakCard: { backgroundColor: 'rgba(245,158,11,0.05)' },
  summaryCard: { padding: 16, borderRadius: 16, backgroundColor: '#1E2D4D' },
  chartCard: { minHeight: 200 },
  logCard: {},
  emptyCard: { gap: 16 },
  logMetric: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
};