// mobile/src/screens/EnergyApplianceScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Badge, Input, ProgressBar } from '@/ui';
import { useEnergy } from '@/hooks/useEnergy';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const APPLIANCE_CATEGORIES = [
  { value: 'refrigeration', label: 'Refrigeration', icon: 'snow', color: '#06B6D4', component: Ionicons },
  { value: 'heating_cooling', label: 'Heating & Cooling', icon: 'thermometer', color: '#EF4444', component: Ionicons },
  { value: 'laundry', label: 'Laundry', icon: 'shirt', color: '#8B5CF6', component: Ionicons },
  { value: 'kitchen', label: 'Kitchen', icon: 'restaurant', color: '#F59E0B', component: Ionicons },
  { value: 'entertainment', label: 'Entertainment', icon: 'tv', color: '#EC4899', component: Ionicons },
  { value: 'lighting', label: 'Lighting', icon: 'bulb', color: '#FBBF24', component: Ionicons },
  { value: 'water_heating', label: 'Water Heating', icon: 'water', color: '#3B82F6', component: Ionicons },
  { value: 'other', label: 'Other', icon: 'extension', color: '#94A3B8', component: Ionicons },
];

const AGE_OPTIONS = ['<1 yr', '1-3 yrs', '3-5 yrs', '5-10 yrs', '10-15 yrs', '15-20 yrs', '20+ yrs'];

export const EnergyApplianceScreen: React.FC = () => {
  const { appliances, createAppliance } = useEnergy();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [wattage, setWattage] = useState('');
  const [age, setAge] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalCost = appliances.reduce((sum: number, a: any) => sum + (a.estimated_annual_cost || 0), 0);
  const totalWattage = appliances.reduce((sum: number, a: any) => sum + (a.wattage || 0), 0);

  const handleAddAppliance = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Appliance name is required');
      return;
    }
    if (!wattage) {
      Alert.alert('Error', 'Wattage is required');
      return;
    }

    setSubmitting(true);
    try {
      await createAppliance({
        name: name.trim(),
        category,
        brand: brand || undefined,
        model_number: model || undefined,
        wattage: parseFloat(wattage) || 0,
        age_years: parseInt(age) || 0,
        usage_hours_per_day: parseFloat(hoursPerDay) || 8,
      });
      resetForm();
      setIsAdding(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add appliance');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('other');
    setBrand('');
    setModel('');
    setWattage('');
    setAge('');
    setHoursPerDay('');
  };

  const getEfficiencyScore = (appliance: any) => {
    const ageYears = appliance.age_years || 0;
    const wattage = appliance.wattage || 0;
    if (ageYears > 15) return { stars: 1, label: 'Poor', color: '$error' };
    if (ageYears > 10) return { stars: 2, label: 'Fair', color: '$warning' };
    if (ageYears > 5) return { stars: 3, label: 'Good', color: '$primary' };
    return { stars: 4, label: 'Excellent', color: '$success' };
  };

  const getEfficiencyStars = (count: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < count ? 'star' : 'star-outline'}
        size={12}
        color={i < count ? '#FBBF24' : '#94A3B8'}
      />
    ));
  };

  const renderAddForm = () => (
    <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.addForm}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
        <Text fontSize="$4" fontWeight="600" color="$color">Add Appliance</Text>
        <Button variant="ghost" size="sm" onPress={() => { setIsAdding(false); resetForm(); }}>
          <Ionicons name="close" size={24} />
        </Button>
      </Stack>

      <Stack gap="4">
        <Input
          label="Appliance Name"
          placeholder="e.g., Samsung Refrigerator"
          value={name}
          onChangeText={setName}
          leftIcon={<Ionicons name="cube" size={20} color="$colorFocus" />}
        />

        <Stack>
          <Text fontSize="$3" fontWeight="600" color="$color" marginBottom="1">Category</Text>
          <Stack flexDirection="row" flexWrap="wrap" gap="2">
            {APPLIANCE_CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                variant={category === cat.value ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setCategory(cat.value)}
              >
                <Stack flexDirection="row" alignItems="center" gap="1">
                  <cat.component name={cat.icon} size={14} />
                  <Text>{cat.label}</Text>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap="3">
          <Input
            label="Brand"
            placeholder="Samsung"
            value={brand}
            onChangeText={setBrand}
            style={{ flex: 1 }}
          />
          <Input
            label="Model"
            placeholder="RF28R7351SR"
            value={model}
            onChangeText={setModel}
            style={{ flex: 1 }}
          />
        </Stack>

        <Stack flexDirection="row" gap="3">
          <Input
            label="Wattage"
            placeholder="725"
            value={wattage}
            onChangeText={setWattage}
            type="decimal"
            rightComponent={<Text fontSize="$2" color="$colorFocus">W</Text>}
            style={{ flex: 1 }}
          />
          <Input
            label="Hours/Day"
            placeholder="8"
            value={hoursPerDay}
            onChangeText={setHoursPerDay}
            type="decimal"
            rightComponent={<Text fontSize="$2" color="$colorFocus">hrs</Text>}
            style={{ flex: 1 }}
          />
        </Stack>

        <Stack>
          <Text fontSize="$3" fontWeight="600" color="$color" marginBottom="1">Age</Text>
          <Stack flexDirection="row" flexWrap="wrap" gap="2">
            {AGE_OPTIONS.map(opt => (
              <Button
                key={opt}
                variant={age === opt ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setAge(opt)}
              >
                {opt}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Button variant="primary" fullWidth loading={submitting} onPress={handleAddAppliance}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="add" size={20} />
            <Text>Add Appliance</Text>
          </Stack>
        </Button>
      </Stack>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="$5" fontWeight="700" color="$color">Appliances</Text>
        <Button variant="primary" size="sm" onPress={() => setIsAdding(true)}>
          <Ionicons name="add" size={20} />
        </Button>
      </Stack>

      {/* Stats */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.statsCard}>
        <Stack flexDirection="row" gap="4">
          <Stack flex={1} alignItems="center">
            <Text fontSize="$6" fontWeight="800" color="$color">{appliances.length}</Text>
            <Text fontSize="$2" color="$colorFocus">Total</Text>
          </Stack>
          <Stack width={1} backgroundColor="$border" />
          <Stack flex={1} alignItems="center">
            <Text fontSize="$6" fontWeight="800" color="$warning">{totalWattage.toLocaleString()}</Text>
            <Text fontSize="$2" color="$colorFocus">Total Watts</Text>
          </Stack>
          <Stack width={1} backgroundColor="$border" />
          <Stack flex={1} alignItems="center">
            <Text fontSize="$6" fontWeight="800" color="$error">{formatCurrency(totalCost)}</Text>
            <Text fontSize="$2" color="$colorFocus">Est. Annual</Text>
          </Stack>
        </Stack>
      </Card>

      {/* Add Form */}
      {isAdding && renderAddForm()}

      {/* Appliance List */}
      <Stack gap="3">
        {appliances.length === 0 && !isAdding ? (
          <Card variant="outlined" padding="xl" alignItems="center">
            <Stack width={64} height={64} borderRadius="full" backgroundColor="$backgroundStrong" alignItems="center" justifyContent="center" marginBottom="3">
              <Ionicons name="cube-outline" size={32} color="$colorFocus" />
            </Stack>
            <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="1">No appliances yet</Text>
            <Text fontSize="$2" color="$colorFocus" textAlign="center" marginBottom="4">Add your household appliances to track energy usage</Text>
            <Button variant="primary" onPress={() => setIsAdding(true)}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Ionicons name="add" size={20} />
                <Text>Add First Appliance</Text>
              </Stack>
            </Button>
          </Card>
        ) : (
          appliances.map((appliance: any) => {
            const efficiency = getEfficiencyScore(appliance);
            const cat = APPLIANCE_CATEGORIES.find(c => c.value === appliance.category) || APPLIANCE_CATEGORIES[7];
            const monthlyKwh = ((appliance.wattage || 0) * (appliance.usage_hours_per_day || 0) * 30) / 1000;
            const monthlyCost = monthlyKwh * 0.15;

            return (
              <Card key={appliance.id} variant="default" padding="md" style={styles.applianceCard}>
                <Stack flexDirection="row" alignItems="center" gap="3">
                  <Stack width={52} height={52} borderRadius="lg" backgroundColor={cat.color + '20'} alignItems="center" justifyContent="center">
                    <cat.component name={cat.icon} size={26} color={cat.color} />
                  </Stack>
                  <Stack flex={1}>
                    <Stack flexDirection="row" alignItems="center" gap="2">
                      <Text fontSize="$3" fontWeight="600" color="$color">{appliance.name}</Text>
                      <Stack flexDirection="row" gap="0.5">{getEfficiencyStars(efficiency.stars)}</Stack>
                    </Stack>
                    <Text fontSize="$2" color="$colorFocus">{cat.label} · {appliance.wattage}W · {appliance.age_years || 0} yrs old</Text>
                    <Text fontSize="$2" color="$colorFocus">{appliance.usage_hours_per_day || 0} hrs/day</Text>
                  </Stack>
                  <Stack alignItems="flex-end" gap="1">
                    <Text fontSize="$3" fontWeight="700" color="$warning">{formatCurrency(monthlyCost)}/mo</Text>
                    <Text fontSize="$2" color="$colorFocus">{monthlyKwh.toFixed(1)} kWh/mo</Text>
                    <Badge variant={efficiency.stars >= 3 ? 'success' : efficiency.stars >= 2 ? 'warning' : 'danger'} size="sm">
                      {efficiency.label}
                    </Badge>
                  </Stack>
                </Stack>
              </Card>
            );
          })
        )}
      </Stack>
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  statsCard: { backgroundColor: '$warning05' },
  addForm: {},
  applianceCard: {},
};