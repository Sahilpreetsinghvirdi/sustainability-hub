// mobile/src/screens/EnergyAuditScreen.tsx
import React from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Badge, ProgressBar } from '@/ui';
import { useEnergy } from '@/hooks/useEnergy';
import { formatCurrency, formatCarbon, formatEnergy } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const RECOMMENDATIONS = [
  {
    id: '1',
    title: 'Replace Water Heater',
    description: 'Your 15-year-old water heater is inefficient. A new heat pump model saves $200/yr.',
    category: 'heating_cooling',
    savings: 200,
    carbonSaved: 1200,
    priority: 'high',
    roi: '2.5 years',
  },
  {
    id: '2',
    title: 'Upgrade Refrigerator',
    description: 'Your fridge (12 yrs) uses 40% more energy than ENERGY STAR models.',
    category: 'refrigeration',
    savings: 84,
    carbonSaved: 320,
    priority: 'medium',
    roi: '4 years',
  },
  {
    id: '3',
    title: 'Seal Window Drafts',
    description: 'Drafty windows waste ~15% of heating/cooling. Weather stripping costs $50.',
    category: 'heating_cooling',
    savings: 120,
    carbonSaved: 480,
    priority: 'medium',
    roi: '<1 year',
  },
  {
    id: '4',
    title: 'Switch to LED Bulbs',
    description: 'Replace 10 incandescent bulbs with LEDs. Save 75% on lighting costs.',
    category: 'lighting',
    savings: 60,
    carbonSaved: 280,
    priority: 'low',
    roi: '6 months',
  },
];

const IMPROVEMENTS = [
  { label: 'Current Rating', score: 45, color: '#EF4444' },
  { label: 'After Fixes', score: 78, color: '#22C55E' },
];

export const EnergyAuditScreen: React.FC = () => {
  const { audit, appliances } = useEnergy();

  const totalSavings = RECOMMENDATIONS.reduce((sum, r) => sum + r.savings, 0);
  const totalCarbonSaved = RECOMMENDATIONS.reduce((sum, r) => sum + r.carbonSaved, 0);
  const currentScore = 45;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#F8FAFC">Energy Audit</Text>
        <Stack width={40} />
      </Stack>

      {/* Score Card */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.scoreCard}>
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={64} height={64} borderRadius="full" backgroundColor="rgba(34,197,94,0.2)" alignItems="center" justifyContent="center">
            <Ionicons name="speedometer" size={32} color="#22C55E" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="8" color="#CBD5E1">HOME ENERGY SCORE</Text>
            <Text fontSize="32" fontWeight="800" color="#22C55E">{currentScore}<Text fontSize="16">/100</Text></Text>
          </Stack>
          <Badge variant="warning" size="lg">Needs Work</Badge>
        </Stack>
        <ProgressBar progress={currentScore} variant="warning" size="lg" />
        <Stack flexDirection="row" justifyContent="space-between" marginTop="2">
          <Text fontSize="4" color="#CBD5E1">Inefficient</Text>
          <Text fontSize="4" color="#CBD5E1">Efficient</Text>
        </Stack>
      </Card>

      {/* Potential Savings */}
      <Card variant="default" padding="lg" marginBottom="lg" style={styles.savingsCard}>
        <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="lg">Potential Annual Savings</Text>
        <Stack flexDirection="row" gap="3">
          <Stack flex={1} alignItems="center" style={styles.savingsItem}>
            <Ionicons name="cash" size={28} color="#22C55E" />
            <Text fontSize="20" fontWeight="800" color="#22C55E" marginTop="2">{formatCurrency(totalSavings)}</Text>
            <Text fontSize="8" color="#CBD5E1">Money Saved</Text>
          </Stack>
          <Stack flex={1} alignItems="center" style={styles.savingsItem}>
            <Ionicons name="leaf" size={28} color="#22C55E" />
            <Text fontSize="20" fontWeight="800" color="#22C55E" marginTop="2">{formatCarbon(totalCarbonSaved)}</Text>
            <Text fontSize="8" color="#CBD5E1">COâ‚‚e Reduced</Text>
          </Stack>
          <Stack flex={1} alignItems="center" style={styles.savingsItem}>
            <Ionicons name="time" size={28} color="#F59E0B" />
            <Text fontSize="20" fontWeight="800" color="#F59E0B" marginTop="2">{RECOMMENDATIONS.length}</Text>
            <Text fontSize="8" color="#CBD5E1">Actions</Text>
          </Stack>
        </Stack>
      </Card>

      {/* Recommendations */}
      <Stack marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
          <Text fontSize="20" fontWeight="700" color="#F8FAFC">Recommendations</Text>
          <Badge variant="outline" size="sm">{RECOMMENDATIONS.length} items</Badge>
        </Stack>
        <Stack gap="3">
          {RECOMMENDATIONS.map(rec => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </Stack>
      </Stack>

      {/* Energy Score Breakdown */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="lg">Score Breakdown</Text>
        <Stack gap="3">
          <ScoreItem label="Heating & Cooling" score={52} maxScore={100} />
          <ScoreItem label="Water Heating" score={30} maxScore={100} />
          <ScoreItem label="Appliances" score={68} maxScore={100} />
          <ScoreItem label="Lighting" score={75} maxScore={100} />
          <ScoreItem label="Insulation" score={40} maxScore={100} />
        </Stack>
      </Card>

      {/* Actions */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth onPress={() => router.push('/energy')}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="checkmark" size={20} />
            <Text>Save Audit Results</Text>
          </Stack>
        </Button>
        <Button variant="outline" fullWidth onPress={() => Alert.alert('Share', 'Report will be shared as a PDF')}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="share" size={20} />
            <Text>Share Report</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>Back to Energy</Button>
      </Stack>
    </ScrollView>
  );
};

const RecommendationCard = ({ recommendation }: any) => {
  const priorityColors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E',
  };
  const categoryIcons: Record<string, any> = {
    heating_cooling: { icon: 'thermometer', component: Ionicons, color: '#EF4444' },
    refrigeration: { icon: 'snow', component: Ionicons, color: '#06B6D4' },
    lighting: { icon: 'bulb', component: Ionicons, color: '#FBBF24' },
    water_heating: { icon: 'water', component: Ionicons, color: '#3B82F6' },
  };
  const cat = categoryIcons[recommendation.category] || categoryIcons.lighting;

  return (
    <Card variant="default" padding="md" style={styles.recommendationCard}>
      <Stack flexDirection="row" alignItems="flex-start" gap="3">
        <Stack width={48} height={48} borderRadius="lg" backgroundColor={cat.color + '20'} alignItems="center" justifyContent="center">
          <cat.component name={cat.icon} size={24} color={cat.color} />
        </Stack>
        <Stack flex={1}>
          <Stack flexDirection="row" alignItems="center" gap="2" marginBottom="1">
            <Text fontSize="12" fontWeight="600" color="#F8FAFC">{recommendation.title}</Text>
            <Badge variant={priorityColors[recommendation.priority] as any} size="sm">
              {recommendation.priority}
            </Badge>
          </Stack>
          <Text fontSize="8" color="#CBD5E1" marginBottom="2">{recommendation.description}</Text>
          <Stack flexDirection="row" gap="4">
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="cash" size={14} color="#22C55E" />
              <Text fontSize="8" fontWeight="600" color="#22C55E">{formatCurrency(recommendation.savings)}/yr</Text>
            </Stack>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="leaf" size={14} color="#22C55E" />
              <Text fontSize="8" fontWeight="600" color="#22C55E">{formatCarbon(recommendation.carbonSaved)}</Text>
            </Stack>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="time" size={14} color="#F59E0B" />
              <Text fontSize="8" fontWeight="600" color="#F59E0B">{recommendation.roi}</Text>
            </Stack>
          </Stack>
        </Stack>
        <Button variant="ghost" size="xs" onPress={() => Alert.alert(recommendation.title, recommendation.description)}>
          <Ionicons name="chevron-forward" size={20} />
        </Button>
      </Stack>
    </Card>
  );
};

const ScoreItem = ({ label, score, maxScore }: any) => {
  const percentage = (score / maxScore) * 100;
  const variant = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'danger';

  return (
    <Stack>
      <Stack flexDirection="row" justifyContent="space-between" marginBottom="1">
        <Text fontSize="12" fontWeight="600" color="#F8FAFC">{label}</Text>
        <Text fontSize="12" fontWeight="700" color={percentage >= 75 ? '#22C55E' : percentage >= 50 ? '#F59E0B' : '#EF4444'}>
          {score}/{maxScore}
        </Text>
      </Stack>
      <ProgressBar progress={percentage} variant={variant} size="sm" />
    </Stack>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  scoreCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  savingsCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  savingsItem: { padding: 12, borderRadius: 12, backgroundColor: '#1E2D4D' },
  recommendationCard: {},
  actions: { marginTop: 8 },
};