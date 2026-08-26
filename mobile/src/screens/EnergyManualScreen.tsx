// mobile/src/screens/EnergyManualScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Input } from '@/ui';
import { useEnergy } from '@/hooks/useEnergy';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const EnergyManualScreen: React.FC = () => {
  const { createBill } = useEnergy();
  const [provider, setProvider] = useState('');
  const [electricityKwh, setElectricityKwh] = useState('');
  const [gasTherms, setGasTherms] = useState('');
  const [waterGallons, setWaterGallons] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!electricityKwh) {
      Alert.alert('Error', 'Electricity usage is required');
      return;
    }
    if (!periodStart || !periodEnd) {
      Alert.alert('Error', 'Billing period dates are required');
      return;
    }

    setSubmitting(true);
    try {
      await createBill({
        utility_provider: provider || undefined,
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        electricity_kwh: parseFloat(electricityKwh) || 0,
        gas_therms: parseFloat(gasTherms) || 0,
        water_gallons: parseFloat(waterGallons) || 0,
        total_cost: parseFloat(totalCost) || 0,
      });
      router.push('/energy');
    } catch (error) {
      Alert.alert('Error', 'Failed to save bill');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedCarbon = (parseFloat(electricityKwh) || 0) * 0.92;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#F2F8F3">Manual Entry</Text>
        <Stack width={40} />
      </Stack>

      {/* Provider */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F2F8F3" marginBottom="lg">Utility Provider</Text>
        <Input
          placeholder="e.g., PG&E, ConEd, Duke Energy"
          value={provider}
          onChangeText={setProvider}
          leftIcon={<Ionicons name="business" size={20} color="#C4D8CB" />}
        />
      </Card>

      {/* Billing Period */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F2F8F3" marginBottom="lg">Billing Period</Text>
        <Stack flexDirection="row" gap="3">
          <Input
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={periodStart}
            onChangeText={setPeriodStart}
            leftIcon={<Ionicons name="calendar" size={20} color="#C4D8CB" />}
            style={{ flex: 1 }}
          />
          <Input
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={periodEnd}
            onChangeText={setPeriodEnd}
            leftIcon={<Ionicons name="calendar" size={20} color="#C4D8CB" />}
            style={{ flex: 1 }}
          />
        </Stack>
      </Card>

      {/* Usage */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F2F8F3" marginBottom="lg">Energy Usage</Text>
        <Stack gap="4">
          <Stack>
            <Stack flexDirection="row" alignItems="center" gap="2" marginBottom="1">
              <Stack width={12} height={12} borderRadius="sm" backgroundColor="#F2B85B" />
              <Text fontSize="12" fontWeight="600" color="#F2F8F3">Electricity</Text>
            </Stack>
            <Input
              placeholder="0"
              value={electricityKwh}
              onChangeText={setElectricityKwh}
              type="decimal"
              leftIcon={<Ionicons name="flash" size={20} color="#F2B85B" />}
              rightComponent={<Text fontSize="8" color="#C4D8CB">kWh</Text>}
            />
          </Stack>

          <Stack>
            <Stack flexDirection="row" alignItems="center" gap="2" marginBottom="1">
              <Stack width={12} height={12} borderRadius="sm" backgroundColor="#E97966" />
              <Text fontSize="12" fontWeight="600" color="#F2F8F3">Natural Gas</Text>
            </Stack>
            <Input
              placeholder="0"
              value={gasTherms}
              onChangeText={setGasTherms}
              type="decimal"
              leftIcon={<MaterialIcons name="local-fire-department" size={20} color="#E97966" />}
              rightComponent={<Text fontSize="8" color="#C4D8CB">therms</Text>}
            />
          </Stack>

          <Stack>
            <Stack flexDirection="row" alignItems="center" gap="2" marginBottom="1">
              <Stack width={12} height={12} borderRadius="sm" backgroundColor="#5DA9C5" />
              <Text fontSize="12" fontWeight="600" color="#F2F8F3">Water</Text>
            </Stack>
            <Input
              placeholder="0"
              value={waterGallons}
              onChangeText={setWaterGallons}
              type="decimal"
              leftIcon={<Ionicons name="water" size={20} color="#5DA9C5" />}
              rightComponent={<Text fontSize="8" color="#C4D8CB">gallons</Text>}
            />
          </Stack>
        </Stack>
      </Card>

      {/* Cost */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F2F8F3" marginBottom="lg">Total Cost</Text>
        <Input
          placeholder="0.00"
          value={totalCost}
          onChangeText={setTotalCost}
          type="decimal"
          leftIcon={<Ionicons name="cash" size={20} color="#C4D8CB" />}
          rightComponent={<Text fontSize="8" color="#C4D8CB">$</Text>}
        />
      </Card>

      {/* Carbon Estimate */}
      {estimatedCarbon > 0 && (
        <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.estimateCard}>
          <Stack flexDirection="row" alignItems="center" gap="3">
            <Stack width={48} height={48} borderRadius="lg" backgroundColor="rgba(34,197,94,0.2)" alignItems="center" justifyContent="center">
              <Ionicons name="leaf" size={24} color="#57C58A" />
            </Stack>
            <Stack flex={1}>
              <Text fontSize="16" fontWeight="600" color="#F2F8F3">Est. Carbon Footprint</Text>
              <Text fontSize="8" color="#C4D8CB">Based on US grid average (0.92 kgCOâ‚‚e/kWh)</Text>
            </Stack>
            <Text fontSize="20" fontWeight="800" color="#57C58A">{estimatedCarbon.toFixed(1)} kg</Text>
          </Stack>
        </Card>
      )}

      {/* Actions */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth loading={submitting} onPress={handleSubmit}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="save" size={20} />
            <Text>Save Bill</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>Cancel</Button>
      </Stack>
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#081A14' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  estimateCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  actions: { marginTop: 8 },
};
