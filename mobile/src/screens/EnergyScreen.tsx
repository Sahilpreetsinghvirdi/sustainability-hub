// mobile/src/screens/EnergyScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useEnergy } from '@/hooks/useEnergy';
import { Card, Button, Badge, ProgressBar } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { formatCurrency, formatEnergy, formatDate } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';

export const EnergyScreen: React.FC = () => {
  const { bills, appliances, recommendations, isLoading, fetchBills, fetchAppliances, scanBill, createManualBill, generateAudit } = useEnergy();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBills(), fetchAppliances()]);
    setRefreshing(false);
  };

  const handleScanPress = async () => {
    const action = await showActionSheet();
    if (action === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          await scanBill(result.assets[0].uri);
          router.push('/energy/review');
        }
      }
    } else if (action === 'gallery') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          await scanBill(result.assets[0].uri);
          router.push('/energy/review');
        }
      }
    } else if (action === 'pdf') {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        // Handle PDF upload
        router.push('/energy/review');
      }
    }
  };

  const handleManualPress = () => {
    router.push('/energy/manual');
  };

  const handleAppliancePress = () => {
    router.push('/energy/appliances');
  };

  const totalEnergy = bills.reduce((sum, b) => sum + b.electricity_kwh, 0);
  const totalCost = bills.reduce((sum, b) => sum + b.total_cost, 0);
  const avgMonthly = bills.length > 0 ? totalEnergy / bills.length : 0;

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
          <Text style={styles.title}>⚡ Energy Tracker</Text>
          <Text style={styles.subtitle}>Monitor your home energy usage</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard
          title="This Month"
          value={`${avgMonthly.toFixed(0)} kWh`}
          subtitle={`${formatCurrency(totalCost / Math.max(1, bills.length))} avg`}
          icon={<Ionicons name="flash-outline" size={24} color={colors.warning} />}
          bgColor="rgba(245, 158, 11, 0.15)"
        />
        <SummaryCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          subtitle={`${bills.length} bills`}
          icon={<Ionicons name="cash-outline" size={24} color={colors.success} />}
          bgColor="rgba(34, 197, 94, 0.15)"
        />
        <SummaryCard
          title="Appliances"
          value={`${appliances.length} tracked`}
          subtitle={recommendations.length > 0 ? `${recommendations.length} tips` : 'Add appliances'}
          icon={<Ionicons name="hardware-chip-outline" size={24} color={colors.secondary[500]} />}
          bgColor="rgba(14, 165, 233, 0.15)"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleScanPress} style={styles.actionButtonPrimary}>
          <Ionicons name="document-text-outline" size={22} color={colors.neutral[0]} />
          <Text style={styles.actionButtonText}>Scan Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleManualPress} style={styles.actionButtonSecondary}>
          <Ionicons name="add-outline" size={22} color={colors.primary[500]} />
          <Text style={styles.actionButtonTextSecondary}>Manual Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAppliancePress} style={styles.actionButtonSecondary}>
          <Ionicons name="settings-outline" size={22} color={colors.secondary[500]} />
          <Text style={styles.actionButtonTextSecondary}>Appliances</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Audit */}
      <Card style={styles.auditCard}>
        <View style={styles.auditHeader}>
          <View style={styles.auditIcon}>
            <MaterialIcons name="analytics" size={28} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.auditTitle}>Home Energy Audit</Text>
            <Text style={styles.auditSubtitle}>Get personalized savings recommendations</Text>
          </View>
        </View>
        <Button
          title="Run Audit"
          icon={<Ionicons name="play-circle-outline" size={18} color={colors.neutral[0]} />}
          onPress={async () => {
            const audit = await generateAudit();
            router.push('/energy/audit');
          }}
          variant="primary"
          fullWidth
        />
      </Card>

      {/* Recommendations Preview */}
      {recommendations.length > 0 && (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 Top Recommendations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recommendationsList}>
            {recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard key={index} rec={rec} />
            ))}
          </View>
        </Card>
      )}

      {/* Bills List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bills</Text>
      </View>

      {bills.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptySubtitle}>Scan your first utility bill to get started</Text>
          <Button title="Scan Bill" onPress={handleScanPress} style={styles.emptyButton} />
        </Card>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BillCard bill={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ScrollView>
  );
};

const showActionSheet = (): Promise<'camera' | 'gallery' | 'pdf'> => {
  return new Promise(resolve => {
    // In production, use react-native-action-sheet or expo-action-sheet
    resolve('camera');
  });
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, subtitle, icon, bgColor }) => (
  <TouchableOpacity style={[styles.summaryCard, { backgroundColor: bgColor }]}>
    <View style={styles.summaryIcon}>{icon}</View>
    <View>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const RecommendationCard: React.FC<{ rec: any }> = ({ rec }) => (
  <View style={styles.recCard}>
    <View style={[styles.recPriority, { backgroundColor: rec.priority === 'high' ? colors.error : rec.priority === 'medium' ? colors.warning : colors.info }]} />
    <View style={styles.recContent}>
      <Text style={styles.recTitle}>{rec.title}</Text>
      <Text style={styles.recDescription}>{rec.description}</Text>
      <View style={styles.recMeta}>
        <Badge variant="outline" size="xs">Save {rec.estimated_savings_usd_year?.toFixed(0)}/yr</Badge>
        <Badge variant="outline" size="xs">{rec.difficulty}</Badge>
      </View>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color={colors.text.tertiary} />
  </View>
);

const BillCard: React.FC<{ bill: any }> = ({ bill }) => (
  <TouchableOpacity style={styles.billCard} onPress={() => router.push(`/energy/bill/${bill.id}`)}>
    <View style={styles.billMain}>
      <View style={styles.billInfo}>
        <View style={styles.billHeader}>
          <Text style={styles.billProvider}>{bill.utility_provider || 'Utility'}</Text>
          <Badge variant="outline" size="xs">{formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}</Badge>
        </View>
        <View style={styles.billMeta}>
          <Text style={styles.billUsage}>{formatEnergy(bill.electricity_kwh)}</Text>
          {bill.gas_therms > 0 && <Text style={styles.billUsage}>{bill.gas_therms.toFixed(1)} therms</Text>}
        </View>
      </View>
      <View style={styles.billCost}>
        <Text style={styles.billCostValue}>{formatCurrency(bill.total_cost)}</Text>
        <Text style={styles.billCostLabel}>Total</Text>
      </View>
    </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
    marginTop: spacing.xs,
  },
  summarySubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionButtonText: {
    color: colors.neutral[0],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  actionButtonTextSecondary: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  auditCard: {},
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  auditIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  auditSubtitle: {
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
  seeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  recommendationsList: {
    gap: spacing.sm,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  recPriority: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  recDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  recMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  billCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  billMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  billInfo: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  billProvider: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  billMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  billUsage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  billCost: {
    alignItems: 'flex-end',
  },
  billCostValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  billCostLabel: {
    fontSize: typography.fontSize.xs,
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
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
});