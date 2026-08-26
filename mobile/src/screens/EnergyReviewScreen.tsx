// mobile/src/screens/EnergyReviewScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Badge, ProgressBar, Input } from '@/ui';
import { useEnergy } from '@/hooks/useEnergy';
import { formatCurrency, formatEnergy, formatDate } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const EnergyReviewScreen: React.FC = () => {
  const { currentBill, updateAppliance, generateAudit } = useEnergy();
  const [editingApplianceId, setEditingApplianceId] = useState<string | null>(null);
  const [editUsage, setEditUsage] = useState('');

  const bill = currentBill;
  if (!bill) return <LoadingScreen />;

  const handleSave = async () => {
    if (editingApplianceId && editUsage) {
      await updateAppliance(editingApplianceId, { usage_hours_per_day: parseFloat(editUsage) });
      setEditingApplianceId(null);
      setEditUsage('');
    }
    router.push('/energy');
  };

  const handleRunAudit = async () => {
    await generateAudit();
    router.push('/energy/audit');
  };

  if (!bill) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#0A0A0A">Review Bill</Text>
        <Stack width={40} />
      </Stack>

      {/* Bill Summary */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.summaryCard}>
        <Stack flexDirection="row" alignItems="center" gap="4">
          <Stack width={56} height={56} borderRadius="lg" backgroundColor="rgba(10,10,10,0.12)" alignItems="center" justifyContent="center">
            <Ionicons name="document-text" size={28} color="#6B6B6B" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="16" fontWeight="600" color="#0A0A0A">{bill.utility_provider || 'Utility Provider'}</Text>
            <Text fontSize="8" color="#444444">
              {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
            </Text>
          </Stack>
          <Stack alignItems="flex-end" gap="1">
            <Text fontSize="24" fontWeight="800" color="#6B6B6B">{formatEnergy(bill.electricity_kwh)}</Text>
            <Text fontSize="8" color="#444444">{formatCurrency(bill.total_cost)}</Text>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap="3" marginTop="lg">
          <StatItem label="Electricity" value={formatEnergy(bill.electricity_kwh)} icon={<Ionicons name="flash" size={18} />} color="#6B6B6B" />
          {bill.gas_therms > 0 && <StatItem label="Gas" value={`${bill.gas_therms.toFixed(1)} th`} icon={<MaterialIcons name="local-fire-department" size={18} />} color="#444444" />}
          {bill.water_gallons > 0 && <StatItem label="Water" value={`${(bill.water_gallons / 1000).toFixed(1)}k gal`} icon={<Ionicons name="water" size={18} />} color="#6B6B6B" />}
        </Stack>
      </Card>

      {/* Appliances */}
      <Stack marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
          <Text fontSize="20" fontWeight="700" color="#0A0A0A">Appliances</Text>
          <Button variant="ghost" size="sm" onPress={() => router.push('/energy/appliances')}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="add" size={16} />
              <Text>Add</Text>
            </Stack>
          </Button>
        </Stack>

        <Stack gap="2">
          {/* Mock appliances for now - would come from store */}
          <ApplianceCard
            name="Refrigerator"
            category="Refrigeration"
            usage="24 hrs/day"
            power="725W"
            age="12 yrs"
            efficiency="â­â­"
            cost="$156/yr"
            color="#1C1C1C"
            onEdit={() => {}}
          />
          <ApplianceCard
            name="Water Heater"
            category="Heating"
            usage="3 hrs/day"
            power="4500W"
            age="15 yrs"
            efficiency="â­"
            cost="$540/yr"
            color="#444444"
            onEdit={() => {}}
          />
          <ApplianceCard
            name="HVAC System"
            category="Heating/Cooling"
            usage="8 hrs/day"
            power="3500W"
            age="10 yrs"
            efficiency="â­â­â­"
            cost="$890/yr"
            color="#6B6B6B"
            onEdit={() => {}}
          />
        </Stack>
      </Stack>

      {/* Quick Actions */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#0A0A0A" marginBottom="lg">Quick Actions</Text>
        <Stack flexDirection="row" gap="3">
          <Button variant="primary" flex={1} onPress={handleRunAudit}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <MaterialIcons name="analytics" size={20} />
              <Text>Run Energy Audit</Text>
            </Stack>
          </Button>
          <Button variant="outline" flex={1} onPress={() => router.push('/energy/appliances')}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="settings" size={20} />
              <Text>Manage Appliances</Text>
            </Stack>
          </Button>
        </Stack>
      </Card>

      {/* Insight */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.insightCard}>
        <Stack flexDirection="row" alignItems="flex-start" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="rgba(10,10,10,0.12)" alignItems="center" justifyContent="center">
            <Ionicons name="lightbulb" size={22} color="#1C1C1C" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="16" fontWeight="600" color="#0A0A0A">Energy Insight</Text>
            <Text fontSize="12" color="#444444" marginTop="1">
              Your fridge (12 yrs) uses ~$156/yr. A new ENERGY STAR model would save ~$84/yr and 320 kg COâ‚‚e.
            </Text>
          </Stack>
        </Stack>
        <Button variant="outline" fullWidth onPress={() => router.push('/energy/audit')}>View Recommendations</Button>
      </Card>

      {/* Actions */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth onPress={handleSave}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="checkmark" size={20} />
            <Text>Save & Continue</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.push('/energy')}>Back to Energy</Button>
      </Stack>
    </ScrollView>
  );
};

const LoadingScreen = () => (
  <Stack style={styles.loading}>
    <Ionicons name="sync" size={48} color="#6B6B6B" />
    <Text fontSize="12" color="#444444" marginTop="3">Loading bill...</Text>
  </Stack>
);

const StatItem = ({ label, value, icon, color }: any) => (
  <Stack flex={1} style={styles.statItem}>
    <Stack width={36} height={36} borderRadius="md" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="16" fontWeight="700" color="#0A0A0A">{value}</Text>
    <Text fontSize="4" color="#444444">{label}</Text>
  </Stack>
);

const ApplianceCard = ({ name, category, usage, power, age, efficiency, cost, color, onEdit }: any) => (
  <Card variant="default" padding="md" style={styles.applianceCard}>
    <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
      <Stack flexDirection="row" alignItems="center" gap="3" flex={1}>
        <Stack width={44} height={44} borderRadius="lg" backgroundColor={color + '20'} alignItems="center" justifyContent="center">
          <MaterialIcons name="devices" size={22} color={color} />
        </Stack>
        <Stack>
          <Stack flexDirection="row" alignItems="center" gap="2">
            <Text fontSize="12" fontWeight="600" color="#0A0A0A">{name}</Text>
            <Text fontSize="4" color="#444444">{efficiency}</Text>
          </Stack>
          <Text fontSize="8" color="#444444">{category} Â· {usage} Â· {power}</Text>
        </Stack>
      </Stack>
      <Stack alignItems="flex-end" gap="1">
        <Text fontSize="16" fontWeight="700" color={color}>{cost}</Text>
        <Text fontSize="4" color="#444444">/year</Text>
        <Text fontSize="4" color="#444444">{age}</Text>
      </Stack>
    </Stack>
  </Card>
);

const styles = {
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 },
  summaryCard: { backgroundColor: 'rgba(10,10,10,0.05)' },
  insightCard: { backgroundColor: 'rgba(10,10,10,0.05)' },
  applianceCard: {},
  statItem: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F4', alignItems: 'center' },
  actions: { marginTop: 8 },
};
