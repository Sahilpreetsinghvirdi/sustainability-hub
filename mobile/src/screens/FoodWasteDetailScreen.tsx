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
    breakfast: { color: '#F59E0B', icon: 'weather-sunny', component: Ionicons },
    lunch: { color: '#EF4444', icon: 'weather-partly-sunny', component: Ionicons },
    dinner: { color: '#8B5CF6', icon: 'moon', component: Ionicons },
    snack: { color: '#EC4899', icon: 'cookie', component: MaterialIcons },
  };
  const config = mealTypeConfig[mealType] || mealTypeConfig.dinner;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="$5" fontWeight="700" color="$color">Meal Detail</Text>
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
                <Ionicons name="image" size={40} color="$colorFocus" />
              </Stack>
            )}
            <Stack style={styles.photoLabel}>
              <Stack flexDirection="row" alignItems="center" gap="1">
                <config.component name={config.icon} size={14} color={config.color} />
                <Text fontSize="$2" fontWeight="600" color="$color">Meal</Text>
              </Stack>
            </Stack>
          </Stack>
          <Stack width={1} backgroundColor="$border" />
          <Stack flex={1}>
            {currentLog.waste_image_url ? (
              <Image source={{ uri: currentLog.waste_image_url }} style={styles.photo} resizeMode="cover" />
            ) : (
              <Stack style={[styles.photo, styles.placeholderPhoto, { backgroundColor: '$success05' }]}>
                <Entypo name="star" size={40} color="$success" />
              </Stack>
            )}
            <Stack style={styles.photoLabel}>
              <Text fontSize="$2" fontWeight="600" color={currentLog.waste_image_url === 'zero-waste' ? '$success' : '$error'}>
                {currentLog.waste_image_url === 'zero-waste' ? 'Zero Waste' : 'Waste'}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Quick Stats */}
      <Card variant="elevated" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" gap="3">
          <StatItem label="Weight" value={formatWeight(currentLog.estimated_weight_grams || 0)} icon={<Ionicons name="scale" size={22} />} color="$error" />
          <StatItem label="Cost" value={formatCurrency(currentLog.estimated_cost || 0)} icon={<Ionicons name="cash" size={22} />} color="$warning" />
          <StatItem label="CO₂e" value={formatCarbon(currentLog.estimated_carbon_kg || 0)} icon={<Ionicons name="leaf" size={22} />} color="$primary" />
        </Stack>
      </Card>

      {/* AI Analysis */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="$primary20" alignItems="center" justifyContent="center">
            <Ionicons name="analytics" size={22} color="$primary" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$color">AI Analysis</Text>
            <Text fontSize="$2" color="$colorFocus">What the photos tell us</Text>
          </Stack>
        </Stack>

        <Stack gap="3">
          {currentLog.ai_analysis && typeof currentLog.ai_analysis === 'object' && (
            <>
              {currentLog.ai_analysis.meal_items && (
                <AnalysisItem
                  title="Meal Items Detected"
                  items={currentLog.ai_analysis.meal_items}
                  color="$primary"
                />
              )}
              {currentLog.ai_analysis.waste_items && (
                <AnalysisItem
                  title="Waste Identified"
                  items={currentLog.ai_analysis.waste_items}
                  color="$error"
                />
              )}
              {currentLog.ai_analysis.waste_category && (
                <Stack flexDirection="row" alignItems="center" gap="2" marginTop="2">
                  <Text fontSize="$2" fontWeight="600" color="$colorFocus">Waste Category:</Text>
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
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="$success20" alignItems="center" justifyContent="center">
            <Ionicons name="bulb" size={22} color="$success" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$color">Prevention Tips</Text>
            <Text fontSize="$2" color="$colorFocus">How to avoid this next time</Text>
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
    <Ionicons name="sync" size={48} color="$primary" />
    <Text fontSize="$3" color="$colorFocus" marginTop="3">Loading meal detail...</Text>
  </Stack>
);

const StatItem = ({ label, value, icon, color }: any) => (
  <Stack flex={1} alignItems="center" style={styles.statItem}>
    <Stack width={40} height={40} borderRadius="lg" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="$4" fontWeight="700" color={color}>{value}</Text>
    <Text fontSize="$1" color="$colorFocus">{label}</Text>
  </Stack>
);

const AnalysisItem = ({ title, items, color }: any) => (
  <Stack>
    <Stack flexDirection="row" alignItems="center" gap="1" marginBottom="1">
      <Stack width={8} height={8} borderRadius="full" backgroundColor={color} />
      <Text fontSize="$3" fontWeight="600" color="$color">{title}</Text>
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
    <Stack width={32} height={32} borderRadius="md" backgroundColor="$success10" alignItems="center" justifyContent="center">
      <Ionicons name={icon} size={16} color="$success" />
    </Stack>
    <Text fontSize="$2" color="$color" flex={1}>{text}</Text>
  </Stack>
);

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 },
  photoCard: { overflow: 'hidden' },
  photo: { width: '100%', height: 140 },
  placeholderPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: '$backgroundStrong' },
  photoLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.7)' },
  statItem: { padding: 12, borderRadius: 12, backgroundColor: '$backgroundStrong' },
  tipsCard: { backgroundColor: '$success05' },
  tipItem: { padding: 8, borderRadius: 8, backgroundColor: '$backgroundStrong' },
  actions: { marginTop: 8 },
};