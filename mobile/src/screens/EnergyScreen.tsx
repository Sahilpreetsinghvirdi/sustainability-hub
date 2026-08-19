// mobile/src/screens/EnergyScreen.tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, Text, Button, Card, Badge, ProgressBar } from '@/ui';
import { useEnergy } from '@/hooks/useEnergy';
import { formatCurrency, formatEnergy, formatDate } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const EnergyScreen: React.FC = () => {
  const { bills, appliances, recommendations, isLoading, fetchBills, fetchAppliances, scanBill, generateAudit } = useEnergy();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBills(), fetchAppliances()]);
    setRefreshing(false);
  };

  const handleScanPress = async () => {
    Alert.alert(
      'Add Energy Bill',
      'Choose how to add your bill',
      [
        { text: 'Camera', onPress: () => handleSource('camera') },
        { text: 'Gallery', onPress: () => handleSource('gallery') },
        { text: 'PDF Document', onPress: () => handleSource('pdf') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSource = async (source: 'camera' | 'gallery' | 'pdf') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
          if (!result.canceled && result.assets[0]) {
            await scanBill(result.assets[0].uri);
            router.push('/energy/review');
          }
        }
      } else if (source === 'gallery') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted) {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
          if (!result.canceled && result.assets[0]) {
            await scanBill(result.assets[0].uri);
            router.push('/energy/review');
          }
        }
      } else if (source === 'pdf') {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
        if (!result.canceled && result.assets[0]) {
          router.push('/energy/review');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to add bill');
    }
  };

  const handleManualPress = () => router.push('/energy/manual');
  const handleAppliancePress = () => router.push('/energy/appliances');

  const totalEnergy = bills.reduce((sum, b) => sum + b.electricity_kwh, 0);
  const totalCost = bills.reduce((sum, b) => sum + b.total_cost, 0);
  const avgMonthly = bills.length > 0 ? totalEnergy / bills.length : 0;

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
            <Stack width={40} height={40} borderRadius="md" backgroundColor="$warning20" alignItems="center" justifyContent="center">
              <Ionicons name="flash" size={24} color="$warning" />
            </Stack>
            <Text fontSize="$7" fontWeight="800" color="$color">Energy Tracker</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <SummaryCard
          title="Avg Monthly"
          value={`${avgMonthly.toFixed(0)} kWh`}
          subtitle={formatCurrency(bills.length ? totalCost / bills.length : 0)} + '/mo'
          icon={<Ionicons name="flash" size={22} />}
          color="$warning"
        />
        <SummaryCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          subtitle={`${bills.length} bills`}
          icon={<Ionicons name="cash" size={22} />}
          color="$success"
        />
        <SummaryCard
          title="Appliances"
          value={`${appliances.length}`}
          subtitle={recommendations.length > 0 ? `${recommendations.length} tips` : 'Add appliances'}
          icon={<MaterialIcons name="devices" size={22} />}
          color="$secondary"
        />
      </Stack>

      {/* Action Buttons */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <ActionButton title="Scan Bill" subtitle="Camera/PDF" icon={<Ionicons name="document-text" size={22} />} onPress={handleScanPress} variant="primary" />
        <ActionButton title="Manual Entry" subtitle="Type readings" icon={<Ionicons name="add" size={22} />} onPress={handleManualPress} variant="secondary" />
        <ActionButton title="Appliances" subtitle="Manage" icon={<MaterialIcons name="settings" size={22} />} onPress={handleAppliancePress} variant="outline" />
      </Stack>

      {/* Quick Audit */}
      <Card variant="elevated" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" gap="4">
          <Stack width={56} height={56} borderRadius="lg" backgroundColor="$primary20" alignItems="center" justifyContent="center">
            <MaterialIcons name="analytics" size={28} color="$primary" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$color">Home Energy Audit</Text>
            <Text fontSize="$2" color="$colorFocus">Get personalized savings recommendations</Text>
          </Stack>
          <Button variant="primary" onPress={async () => { await generateAudit(); router.push('/energy/audit'); }}>
            <Stack flexDirection="row" alignItems="center" gap="2">
              <Ionicons name="play" size={18} />
              <Text>Run Audit</Text>
            </Stack>
          </Button>
        </Stack>
      </Card>

      {/* Recommendations Preview */}
      {recommendations.length > 0 && (
        <Stack marginBottom="lg">
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
            <Text fontSize="$5" fontWeight="700" color="$color">Top Recommendations</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </Stack>
          <Stack gap="2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard key={index} rec={rec} />
            ))}
          </Stack>
        </Stack>
      )}

      {/* Bills List */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
        <Text fontSize="$5" fontWeight="700" color="$color">Recent Bills</Text>
      </Stack>

      {bills.length === 0 ? (
        <Card variant="filled" padding="xl" alignItems="center" style={styles.emptyCard}>
          <Ionicons name="document-text" size={56} color="$colorFocus" />
          <Text fontSize="$5" fontWeight="600" color="$color" marginTop="3" marginBottom="1">No bills yet</Text>
          <Text fontSize="$3" color="$colorFocus" textAlign="center" marginBottom="4">Scan your first utility bill</Text>
          <Button variant="primary" onPress={handleScanPress}>Scan Bill</Button>
        </Card>
      ) : (
        <Stack gap="2">
          {bills.map((bill) => <BillCard key={bill.id} bill={bill} />)}
        </Stack>
      )}
    </ScrollView>
  );
};

const SummaryCard = ({ title, value, subtitle, icon, color }: any) => (
  <Stack flex={1} style={styles.summaryCard}>
    <Stack width={44} height={44} borderRadius="lg" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="$2" color="$colorFocus" textTransform="uppercase" letterSpacing={1}>{title}</Text>
    <Text fontSize="$6" fontWeight="800" color="$color" marginTop="1">{value}</Text>
    <Text fontSize="$1" color="$colorFocus">{subtitle}</Text>
  </Stack>
);

const ActionButton = ({ title, subtitle, icon, onPress, variant }: any) => (
  <Button variant={variant} onPress={onPress} style={{ flex: 1 }} leftIcon={icon}>
    <Stack>
      <Text fontSize="$3" fontWeight="600">{title}</Text>
      <Text fontSize="$1" opacity={0.8}>{subtitle}</Text>
    </Stack>
  </Button>
);

const RecommendationCard = ({ rec }: any) => (
  <Card variant="default" padding="md" style={styles.recCard}>
    <Stack flexDirection="row" alignItems="flex-start" gap="3">
      <Stack width={4} height="100%" borderRadius="full" backgroundColor={
        rec.priority === 'high' ? '$error' :
        rec.priority === 'medium' ? '$warning' : '$info'
      } />
      <Stack flex={1}>
        <Text fontSize="$3" fontWeight="600" color="$color">{rec.title}</Text>
        <Text fontSize="$2" color="$colorFocus" marginTop="1">{rec.description}</Text>
        <Stack flexDirection="row" gap="2" marginTop="3">
          <Badge variant="outline" size="xs">Save ${rec.estimated_savings_usd_year?.toFixed(0)}/yr</Badge>
          <Badge variant="outline" size="xs">{rec.difficulty}</Badge>
        </Stack>
      </Stack>
      <Ionicons name="chevron-forward" size={20} color="$colorFocus" />
    </Stack>
  </Card>
);

const BillCard = ({ bill }: any) => (
  <Card variant="default" padding="md" style={styles.billCard}>
    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
      <Stack flexDirection="row" alignItems="center" gap="3" flex={1}>
        <Stack width={44} height={44} borderRadius="lg" backgroundColor="$warning20" alignItems="center" justifyContent="center">
          <Ionicons name="document-text" size={20} color="$warning" />
        </Stack>
        <Stack>
          <Stack flexDirection="row" alignItems="center" gap="2">
            <Text fontSize="$3" fontWeight="600" color="$color">{bill.utility_provider || 'Utility'}</Text>
            <Badge variant="outline" size="xs">{formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}</Badge>
          </Stack>
          <Stack flexDirection="row" gap="3" marginTop="1">
            <Text fontSize="$2" color="$colorFocus">{formatEnergy(bill.electricity_kwh)}</Text>
            {bill.gas_therms > 0 && <Text fontSize="$2" color="$colorFocus">{bill.gas_therms.toFixed(1)} therms</Text>}
          </Stack>
        </Stack>
      </Stack>
      <Stack alignItems="flex-end">
        <Text fontSize="$5" fontWeight="700" color="$color">{formatCurrency(bill.total_cost)}</Text>
        <Text fontSize="$1" color="$colorFocus">Total</Text>
        <Ionicons name="chevron-forward" size={20} color="$colorFocus" />
      </Stack>
    </Stack>
  </Card>
);

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  summaryCard: { padding: 16, borderRadius: 16, backgroundColor: '$backgroundStrong' },
  recCard: {},
  billCard: {},
  emptyCard: { gap: 16 },
};