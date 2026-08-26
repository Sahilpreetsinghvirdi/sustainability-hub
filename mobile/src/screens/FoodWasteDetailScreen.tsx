// mobile/src/screens/FoodWasteDetailScreen.tsx
import React from 'react';
import { ScrollView, Image } from 'react-native';
import { Stack, Text, Button, Card, Badge, ProgressBar } from '@/ui';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { formatWeight, formatCarbon, formatCurrency, formatDate, getMealColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';

export const FoodWasteDetailScreen: React.FC = () => {
  const { currentLog } = useFoodWaste();

  if (!currentLog) return <LoadingScreen />;

  const mealType = currentLog.meal_type || 'dinner';
  const mealTypeConfig: Record<string, { color: string; icon: string; component: any }> = {
    breakfast: { color: '#6B6B6B', icon: 'weather-sunny', component: Ionicons },
    lunch: { color: '#444444', icon: 'weather-partly-sunny', component: Ionicons },
    dinner: { color: '#6B6B6B', icon: 'moon', component: Ionicons },
    snack: { color: '#6B6B6B', icon: 'cookie', component: MaterialIcons },
  };
  const config = mealTypeConfig[mealType] || mealTypeConfig.dinner;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#0A0A0A">Meal Detail</Text>
        <Stack width={40} />
      </Stack>

      {/* Photos */}
      <Card variant="elevated" padding="0" overflow="hidden" marginBottom="lg" style={styles.photoCard}>
        <Stack flexDirection="row">
          <Stack flex={1}>
            {currentLog.meal_image_url ? (
              <Image source={{ uri: currentLog.meal_image_url }} style={styles.photo} resizeMode="cover" />
            ) : (
              <Stack style={[styles.photo, styles.placeholderPhoto]}>
                <Ionicons name="image" size={40} color="#444444" />
              </Stack>
            )}
            <Stack style={styles.photoLabel}>
              <Stack flexDirection="row" alignItems="center" gap="1">
                <config.component name={config.icon} size={14} color={config.color} />
                <Text fontSize="8" fontWeight="600" color="#0A0A0A">Meal</Text>
              </Stack>
            </Stack>
          </Stack>
          <Stack width={1} backgroundColor="#DADADA" />
          <Stack flex={1}>
            {currentLog.waste_image_url ? (
              <Image source={{ uri: currentLog.waste_image_url }} style={styles.photo} resizeMode="cover" />
            ) : (
              <Stack style={[styles.photo, styles.placeholderPhoto, { backgroundColor: 'rgba(10,10,10,0.05)' }]}>
                <Entypo name="star" size={40} color="#1C1C1C" />
              </Stack>
            )}
            <Stack style={styles.photoLabel}>
              <Text fontSize="8" fontWeight="600" color={currentLog.waste_image_url === 'zero-waste' ? '#1C1C1C' : '#444444'}>
                {currentLog.waste_image_url === 'zero-waste' ? 'Zero Waste' : 'Waste'}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Quick Stats */}
      <Card variant="elevated" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" gap="3">
          <StatItem label="Weight" value={formatWeight(currentLog.estimated_weight_grams || 0)} icon={<Ionicons name="scale" size={22} />} color="#444444" />
          <StatItem label="Cost" value={formatCurrency(currentLog.estimated_cost || 0)} icon={<Ionicons name="cash" size={22} />} color="#6B6B6B" />
          <StatItem label="COâ‚‚e" value={formatCarbon(currentLog.estimated_carbon_kg || 0)} icon={<Ionicons name="leaf" size={22} />} color="#1C1C1C" />
        </Stack>
      </Card>

      {/* AI Analysis */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="rgba(10,10,10,0.12)" alignItems="center" justifyContent="center">
            <Ionicons name="analytics" size={22} color="#1C1C1C" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="16" fontWeight="600" color="#0A0A0A">AI Analysis</Text>
            <Text fontSize="8" color="#444444">What the photos tell us</Text>
          </Stack>
        </Stack>

        <Stack gap="3">
          {currentLog.ai_analysis && typeof currentLog.ai_analysis === 'object' && (
            <>
              {currentLog.ai_analysis.meal_items && (
                <AnalysisItem
                  title="Meal Items Detected"
                  items={currentLog.ai_analysis.meal_items}
                  color="#1C1C1C"
                />
              )}
              {currentLog.ai_analysis.waste_items && (
                <AnalysisItem
                  title="Waste Identified"
                  items={currentLog.ai_analysis.waste_items}
                  color="#444444"
                />
              )}
              {currentLog.ai_analysis.waste_category && (
                <Stack flexDirection="row" alignItems="center" gap="2" marginTop="2">
                  <Text fontSize="8" fontWeight="600" color="#444444">Waste Category:</Text>
                  <Badge variant="outline" size="sm">{currentLog.ai_analysis.waste_category}</Badge>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Card>

      {/* Waste Prevention Tips */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.tipsCard}>
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="rgba(10,10,10,0.12)" alignItems="center" justifyContent="center">
            <Ionicons name="bulb" size={22} color="#1C1C1C" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="16" fontWeight="600" color="#0A0A0A">Prevention Tips</Text>
            <Text fontSize="8" color="#444444">How to avoid this next time</Text>
          </Stack>
        </Stack>

        <Stack gap="2">
          <TipItem text="Cook smaller portions to match your appetite" icon="cut" />
          <TipItem text="Store leftovers in clear containers so you remember them" icon="eye" />
          <TipItem text="Freeze extras within 2 days for later use" icon="snow" />
          <TipItem text="Plan meals around what's already in your fridge" icon="list" />
        </Stack>
      </Card>

      {/* Actions */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth onPress={() => router.back()}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="checkmark" size={20} />
            <Text>Done</Text>
          </Stack>
        </Button>
        <Button variant="outline" fullWidth onPress={() => router.push('/food-waste/log')}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="add" size={20} />
            <Text>Log Another Meal</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>Back to Food Waste</Button>
      </Stack>
    </ScrollView>
  );
};

const LoadingScreen = () => (
  <Stack style={styles.loading}>
    <Ionicons name="sync" size={48} color="#1C1C1C" />
    <Text fontSize="12" color="#444444" marginTop="3">Loading meal detail...</Text>
  </Stack>
);

const StatItem = ({ label, value, icon, color }: any) => (
  <Stack flex={1} alignItems="center" style={styles.statItem}>
    <Stack width={40} height={40} borderRadius="lg" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="16" fontWeight="700" color={color}>{value}</Text>
    <Text fontSize="4" color="#444444">{label}</Text>
  </Stack>
);

const AnalysisItem = ({ title, items, color }: any) => (
  <Stack>
    <Stack flexDirection="row" alignItems="center" gap="1" marginBottom="1">
      <Stack width={8} height={8} borderRadius="full" backgroundColor={color} />
      <Text fontSize="12" fontWeight="600" color="#0A0A0A">{title}</Text>
    </Stack>
    <Stack flexDirection="row" flexWrap="wrap" gap="1">
      {(Array.isArray(items) ? items : [items]).map((item: string, idx: number) => (
        <Badge key={idx} variant="outline" size="sm">{item}</Badge>
      ))}
    </Stack>
  </Stack>
);

const TipItem = ({ text, icon }: any) => (
  <Stack flexDirection="row" alignItems="center" gap="3" style={styles.tipItem}>
    <Stack width={32} height={32} borderRadius="md" backgroundColor="rgba(10,10,10,0.08)" alignItems="center" justifyContent="center">
      <Ionicons name={icon} size={16} color="#1C1C1C" />
    </Stack>
    <Text fontSize="8" color="#0A0A0A" flex={1}>{text}</Text>
  </Stack>
);

const styles = {
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 },
  photoCard: { overflow: 'hidden' },
  photo: { width: '100%', height: 140 },
  placeholderPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F4' },
  photoLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.7)' },
  statItem: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F4' },
  tipsCard: { backgroundColor: 'rgba(10,10,10,0.05)' },
  tipItem: { padding: 8, borderRadius: 8, backgroundColor: '#F5F5F4' },
  actions: { marginTop: 8 },
};
