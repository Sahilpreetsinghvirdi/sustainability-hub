// mobile/src/screens/CarbonScreen.tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, Text, Button, Card, Badge, ProgressBar } from '@/ui';
import { useCarbon } from '@/hooks/useCarbon';
import { formatCurrency, formatCarbon, formatDate } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const CarbonScreen: React.FC = () => {
  const { scans, isLoading, isScanning, scanProgress, fetchScans, scanReceipt } = useCarbon();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScans();
    setRefreshing(false);
  };

  const handleScanPress = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await scanReceipt(result.assets[0].uri);
        router.push('/carbon/review');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Error', 'Failed to scan receipt');
    }
  };

  const handleCameraPress = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await scanReceipt(result.assets[0].uri);
        router.push('/carbon/review');
      }
    } catch (error) {
      console.error('Camera failed:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleManualPress = () => router.push('/carbon/manual');

  const totalCarbon = scans
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.total_carbon_kg, 0);

  const completedScans = scans.filter(s => s.status === 'completed').length;

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
            <Stack width={40} height={40} borderRadius="md" backgroundColor="$primary20" alignItems="center" justifyContent="center">
              <Ionicons name="leaf" size={24} color="$primary" />
            </Stack>
            <Text fontSize="$7" fontWeight="800" color="$color">Carbon Tracker</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Summary Card */}
      <Card variant="elevated" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" gap="4">
          <Stack width={56} height={56} borderRadius="lg" backgroundColor="$primary20" alignItems="center" justifyContent="center">
            <Ionicons name="analytics" size={28} color="$primary" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$2" color="$colorFocus" textTransform="uppercase" letterSpacing={1}>This Month</Text>
            <Text fontSize="$8" fontWeight="800" color="$color" marginTop="1">{formatCarbon(totalCarbon)}</Text>
            <ProgressBar
              progress={Math.min(100, (totalCarbon / 200) * 100)}
              variant={totalCarbon > 180 ? 'danger' : totalCarbon > 140 ? 'warning' : 'success'}
              size="sm"
              showLabel
              label="Budget: 200 kg CO₂e"
              style={{ marginTop: 3 }}
            />
          </Stack>
        </Stack>
      </Card>

      {/* Quick Stats */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <StatCard label="Scans" value={scans.length} icon={<Ionicons name="document-text" size={20} />} color="$secondary" />
        <StatCard label="Completed" value={completedScans} icon={<Ionicons name="checkmark-circle" size={20} />} color="$success" />
        <StatCard label="Avg/Scan" value={scans.length ? formatCarbon(totalCarbon / scans.length) : '0 kg'} icon={<Ionicons name="calculator" size={20} />} color="$warning" />
      </Stack>

      {/* Action Buttons */}
      <Stack flexDirection="row" gap="3" marginBottom="lg">
        <ActionButton title="Scan Receipt" subtitle="Camera" icon={<Ionicons name="camera" size={22} />} onPress={handleCameraPress} variant="primary" />
        <ActionButton title="Import Photo" subtitle="Gallery" icon={<Ionicons name="image" size={22} />} onPress={handleScanPress} variant="secondary" />
        <ActionButton title="Manual Entry" subtitle="Type items" icon={<Ionicons name="pencil" size={22} />} onPress={handleManualPress} variant="outline" />
      </Stack>

      {/* Scanning Progress */}
      {isScanning && (
        <Card variant="default" padding="md" marginBottom="lg" borderColor="$primary" borderWidth={2}>
          <Stack flexDirection="row" alignItems="center" gap="3">
            <Ionicons name="sync" size={28} color="$primary" />
            <Stack flex={1}>
              <Text fontSize="$4" fontWeight="600" color="$color">Processing Receipt...</Text>
              <Text fontSize="$2" color="$colorFocus">{scanProgress > 0 ? `${scanProgress}% complete` : 'Extracting text & matching items'}</Text>
            </Stack>
            <ProgressBar progress={scanProgress} variant="primary" size="md" style={{ width: 100 }} />
          </Stack>
        </Card>
      )}

      {/* Scans List */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
        <Text fontSize="$5" fontWeight="700" color="$color">Recent Scans</Text>
        {scans.length > 0 && <Badge variant="outline" size="sm">{scans.length} total</Badge>}
      </Stack>

      {scans.length === 0 ? (
        <Card variant="filled" padding="xl" alignItems="center" style={styles.emptyCard}>
          <Ionicons name="receipt" size={56} color="$colorFocus" />
          <Text fontSize="$5" fontWeight="600" color="$color" marginTop="3" marginBottom="1">No scans yet</Text>
          <Text fontSize="$3" color="$colorFocus" textAlign="center" marginBottom="4">Start tracking your carbon footprint</Text>
          <Button variant="primary" onPress={handleCameraPress}>Scan First Receipt</Button>
        </Card>
      ) : (
        <Stack gap="2">
          {scans.map((scan, index) => (
            <ScanCard key={scan.id} scan={scan} index={index} />
          ))}
        </Stack>
      )}
    </ScrollView>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <Stack flex={1} style={styles.statCard}>
    <Stack width={36} height={36} borderRadius="md" backgroundColor={color + '20'} alignItems="center" justifyContent="center" marginBottom="2">
      {icon}
    </Stack>
    <Text fontSize="$5" fontWeight="700" color="$color">{value}</Text>
    <Text fontSize="$1" color="$colorFocus">{label}</Text>
  </Stack>
);

const ActionButton = ({ title, subtitle, icon, onPress, variant }: any) => (
  <Button
    variant={variant}
    onPress={onPress}
    style={{ flex: 1 }}
    leftIcon={icon}
  >
    <Stack>
      <Text fontSize="$3" fontWeight="600">{title}</Text>
      <Text fontSize="$1" opacity={0.8}>{subtitle}</Text>
    </Stack>
  </Button>
);

const ScanCard = ({ scan, index }: any) => (
  <Card variant="default" padding="md" style={styles.scanCard}>
    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
      <Stack flexDirection="row" alignItems="center" gap="3" flex={1}>
        <Stack width={44} height={44} borderRadius="lg" backgroundColor="$primary20" alignItems="center" justifyContent="center">
          <Ionicons name="receipt" size={20} color="$primary" />
        </Stack>
        <Stack>
          <Stack flexDirection="row" alignItems="center" gap="2">
            <Text fontSize="$3" fontWeight="600" color="$color">{scan.store_name || 'Unknown Store'}</Text>
            <Badge
              variant={
                scan.status === 'completed' ? 'success' :
                scan.status === 'processing' ? 'warning' :
                scan.status === 'failed' ? 'danger' : 'default'
              }
              size="xs"
            >
              {scan.status}
            </Badge>
          </Stack>
          <Text fontSize="$1" color="$colorFocus">{formatDate(scan.scanned_at)}</Text>
        </Stack>
      </Stack>
      <Stack alignItems="flex-end" gap="1">
        <Text fontSize="$5" fontWeight="700" color="$primary">{formatCarbon(scan.total_carbon_kg)}</Text>
        <Text fontSize="$1" color="$colorFocus">{formatCurrency(scan.total_amount)}</Text>
        <Ionicons name="chevron-forward" size={20} color="$colorFocus" />
      </Stack>
    </Stack>
  </Card>
);

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  statCard: { padding: 16, borderRadius: 16, backgroundColor: '$backgroundStrong' },
  scanCard: {},
  emptyCard: { gap: 16 },
};