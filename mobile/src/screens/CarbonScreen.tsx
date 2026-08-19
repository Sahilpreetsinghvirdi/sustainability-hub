// mobile/src/screens/CarbonScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useCarbon } from '@/hooks/useCarbon';
import { Card, Button, Badge, ProgressBar } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { formatCarbon, formatCurrency, formatDate, getCategoryColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { Camera, ImagePicker } from 'expo-camera';
import * as ImagePickerLib from 'expo-image-picker';
import { router } from 'expo-router';

export const CarbonScreen: React.FC = () => {
  const { scans, isLoading, isScanning, scanProgress, fetchScans, scanReceipt, manualEntry } = useCarbon();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScans();
    setRefreshing(false);
  };

  const handleScanPress = async () => {
    try {
      const permission = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePickerLib.launchImageLibraryAsync({
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
    }
  };

  const handleCameraPress = async () => {
    try {
      const permission = await ImagePickerLib.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePickerLib.launchCameraAsync({
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
    }
  };

  const handleManualPress = () => {
    router.push('/carbon/manual');
  };

  const totalCarbon = scans
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.total_carbon_kg, 0);

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
          <Text style={styles.title}>🛒 Carbon Tracker</Text>
          <Text style={styles.subtitle}>Track your purchase footprint</Text>
        </View>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Ionicons name="leaf-outline" size={28} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>{formatCarbon(totalCarbon)}</Text>
          </View>
          <ProgressBar
            progress={Math.min(100, (totalCarbon / 200) * 100)}
            variant={totalCarbon > 180 ? 'danger' : totalCarbon > 140 ? 'warning' : 'success'}
            size="md"
            showLabel
            label="Budget: 200 kg CO₂e"
          />
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsGrid}>
        <ActionButton
          title="Scan Receipt"
          subtitle="Auto-extract items"
          icon={<Ionicons name="camera-outline" size={28} color={colors.neutral[0]} />}
          onPress={handleCameraPress}
          bgColor={colors.primary[500]}
        />
        <ActionButton
          title="Import Photo"
          subtitle="From gallery"
          icon={<Ionicons name="image-outline" size={28} color={colors.neutral[0]} />}
          onPress={handleScanPress}
          bgColor={colors.secondary[500]}
        />
        <ActionButton
          title="Manual Entry"
          subtitle="Add items manually"
          icon={<Ionicons name="pencil-outline" size={28} color={colors.neutral[0]} />}
          onPress={handleManualPress}
          bgColor={colors.neutral[700]}
        />
      </View>

      {/* Scanning Progress */}
      {isScanning && (
        <Card style={styles.scanningCard}>
          <View style={styles.scanningContent}>
            <Ionicons name="sync" size={32} color={colors.primary[500]} style={styles.spinning} />
            <View style={styles.scanningText}>
              <Text style={styles.scanningTitle}>Processing Receipt...</Text>
              <Text style={styles.scanningSubtitle}>
                {scanProgress > 0 ? `${scanProgress}% complete` : 'Extracting text & matching items'}
              </Text>
            </View>
            <ProgressBar progress={scanProgress} variant="primary" size="md" />
          </View>
        </Card>
      )}

      {/* Scans List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {scans.length > 0 && (
          <Text style={styles.scanCount}>{scans.length} total</Text>
        )}
      </View>

      {scans.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySubtitle}>Start tracking your carbon footprint</Text>
          <Button title="Scan First Receipt" onPress={handleCameraPress} style={styles.emptyButton} />
        </Card>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ScanCard scan={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => null}
        />
      )}
    </ScrollView>
  );
};

const ActionButton: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  bgColor: string;
}> = ({ title, subtitle, icon, onPress, bgColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.actionButton, { backgroundColor: bgColor }]}>
    <View style={styles.actionIcon}>{icon}</View>
    <View style={styles.actionText}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color={colors.neutral[0]} />
  </TouchableOpacity>
);

const ScanCard: React.FC<{ scan: any }> = ({ scan }) => (
  <TouchableOpacity style={styles.scanCard} onPress={() => router.push(`/carbon/scan/${scan.id}`)}>
    <View style={styles.scanMain}>
      <View style={styles.scanInfo}>
        <View style={styles.scanHeader}>
          <Text style={styles.scanStore}>{scan.store_name || 'Unknown Store'}</Text>
          <Badge
            variant={scan.status === 'completed' ? 'success' : scan.status === 'processing' ? 'warning' : 'danger'}
            size="sm"
          >
            {scan.status}
          </Badge>
        </View>
        <Text style={styles.scanDate}>{formatDate(scan.scanned_at)}</Text>
        <View style={styles.scanMeta}>
          <Text style={styles.scanItems}>{scan.items?.length || 0} items</Text>
          <Text style={styles.scanAmount}>{formatCurrency(scan.total_amount)}</Text>
        </View>
      </View>
      <View style={styles.scanCarbon}>
        <Text style={styles.scanCarbonValue}>{formatCarbon(scan.total_carbon_kg)}</Text>
        <Text style={styles.scanCarbonLabel}>CO₂e</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color={colors.text.tertiary} />
  </TouchableOpacity>
);

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
  summaryCard: {},
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    minHeight: 80,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[0],
  },
  actionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scanningCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: colors.primary[500],
    borderWidth: 1,
  },
  scanningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spinning: {
    // Animation would be added via Animated
  },
  scanningText: {
    flex: 1,
  },
  scanningTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scanningSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scanCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
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
  scanCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  scanMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  scanInfo: {
    flex: 1,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scanStore: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scanDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  scanMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  scanItems: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  scanAmount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  scanCarbon: {
    alignItems: 'flex-end',
  },
  scanCarbonValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  scanCarbonLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
});