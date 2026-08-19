// mobile/src/screens/SettingsScreen.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { Card, Button, Badge } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { config } from '@/constants/config';

export const SettingsScreen: React.FC = () => {
  const {
    preferences,
    theme,
    notificationsEnabled,
    biometricEnabled,
    autoSyncEnabled,
    syncFrequency,
    dataSaverMode,
    units,
    setPreferences,
    setTheme,
    setNotificationsEnabled,
    setBiometricEnabled,
    setAutoSyncEnabled,
    setSyncFrequency,
    setDataSaverMode,
    setUnits,
  } = useSettingsStore();

  const { user, logout } = useAuthStore();
  const { lastSyncAt, fetchStatus } = useSyncStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Not implemented yet') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>
        <View style={styles.profileStats}>
          <StatItem label="Carbon" value="187 kg" />
          <StatItem label="Energy" value="423 kWh" />
          <StatItem label="Waste" value="4.2 kg" />
        </View>
      </Card>

      {/* Preferences */}
      <Section title="Preferences">
        <Card>
          <SettingRow
            title="Monthly Carbon Budget"
            subtitle="Target kg CO₂e per month"
            value={`${preferences.carbon_budget_monthly_kg} kg`}
            onPress={() => showNumberInput('Carbon Budget', 'carbon_budget_monthly_kg', preferences.carbon_budget_monthly_kg, setPreferences)}
          />
          <Divider />
          <SettingRow
            title="Monthly Energy Target"
            subtitle="Target kWh per month"
            value={`${preferences.energy_target_kwh_monthly} kWh`}
            onPress={() => showNumberInput('Energy Target', 'energy_target_kwh_monthly', preferences.energy_target_kwh_monthly, setPreferences)}
          />
          <Divider />
          <SettingRow
            title="Monthly Food Waste Target"
            subtitle="Target kg of avoidable waste"
            value={`${preferences.food_waste_target_kg_monthly} kg`}
            onPress={() => showNumberInput('Waste Target', 'food_waste_target_kg_monthly', preferences.food_waste_target_kg_monthly, setPreferences)}
          />
        </Card>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Card>
          <SettingRow
            title="Theme"
            subtitle="Choose app appearance"
            value={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onPress={() => showThemePicker()}
          />
          <Divider />
          <SettingRow
            title="Units"
            subtitle="Measurement system"
            value={units === 'metric' ? 'Metric (kg, kWh)' : 'Imperial (lbs, kWh)'}
            onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          />
        </Card>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Card>
          <SettingToggle
            title="Push Notifications"
            subtitle="Receive reminders and insights"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
          <Divider />
          <SettingToggle
            title="Biometric Auth"
            subtitle="Use Face ID / Fingerprint"
            value={biometricEnabled}
            onChange={setBiometricEnabled}
          />
        </Card>
      </Section>

      {/* Sync & Data */}
      <Section title="Sync & Data">
        <Card>
          <SettingToggle
            title="Auto Sync"
            subtitle="Automatically sync with cloud"
            value={autoSyncEnabled}
            onChange={setAutoSyncEnabled}
          />
          <Divider />
          <SettingRow
            title="Sync Frequency"
            subtitle="How often to sync"
            value={`${syncFrequency} minutes`}
            onPress={() => showSyncFrequencyPicker()}
          />
          <Divider />
          <SettingToggle
            title="Data Saver Mode"
            subtitle="Reduce data usage on mobile"
            value={dataSaverMode}
            onChange={setDataSaverMode}
          />
          <Divider />
          <SettingRow
            title="Last Sync"
            subtitle={lastSyncAt ? formatSyncTime(lastSyncAt) : 'Never'}
            value="Tap to sync now"
            onPress={() => fetchStatus()}
          />
        </Card>
      </Section>

      {/* Account */}
      <Section title="Account">
        <Card>
          <SettingRow
            title="Edit Profile"
            subtitle="Name, email, password"
            icon={<Ionicons name="person-outline" size={22} color={colors.primary[500]} />}
            onPress={() => router.push('/settings/profile')}
          />
          <Divider />
          <SettingRow
            title="Household"
            subtitle="Manage members and settings"
            icon={<Ionicons name="people-outline" size={22} color={colors.secondary[500]} />}
            onPress={() => router.push('/settings/household')}
          />
          <Divider />
          <SettingRow
            title="Export Data"
            subtitle="Download your data as CSV/JSON"
            icon={<Ionicons name="download-outline" size={22} color={colors.warning} />}
            onPress={() => Alert.alert('Export', 'Feature coming soon')}
          />
          <Divider />
          <SettingRow
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon={<Ionicons name="trash-outline" size={22} color={colors.error} />}
            destructive
            onPress={handleDeleteAccount}
          />
        </Card>
      </Section>

      {/* About */}
      <Section title="About">
        <Card>
          <SettingRow
            title="Version"
            subtitle={config.app.version}
            value="Build " + config.app.buildNumber
          />
          <Divider />
          <SettingRow
            title="Privacy Policy"
            icon={<Ionicons name="document-text-outline" size={22} color={colors.text.tertiary} />}
            onPress={() => Alert.alert('Privacy Policy', config.app.privacyUrl)}
          />
          <Divider />
          <SettingRow
            title="Terms of Service"
            icon={<Ionicons name="document-text-outline" size={22} color={colors.text.tertiary} />}
            onPress={() => Alert.alert('Terms of Service', config.app.termsUrl)}
          />
          <Divider />
          <SettingRow
            title="Contact Support"
            subtitle={config.app.supportEmail}
            icon={<Ionicons name="mail-outline" size={22} color={colors.primary[500]} />}
            onPress={() => Alert.alert('Support', config.app.supportEmail)}
          />
        </Card>
      </Section>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button title="Logout" variant="danger" fullWidth onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const showNumberInput = (title: string, key: string, currentValue: number, setter: (v: any) => void) => {
  Alert.alert(
    title,
    'Enter new value',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => setter({ [key]: currentValue + 10 }), // Simplified
      },
    ]
  );
};

const showThemePicker = () => {
  Alert.alert('Theme', 'Select theme', [
    { text: 'Light', onPress: () => useSettingsStore.getState().setTheme('light') },
    { text: 'Dark', onPress: () => useSettingsStore.getState().setTheme('dark') },
    { text: 'System', onPress: () => useSettingsStore.getState().setTheme('system') },
    { text: 'Cancel', style: 'cancel' },
  ]);
};

const showSyncFrequencyPicker = () => {
  Alert.alert('Sync Frequency', 'Choose how often to sync', [
    { text: '1 minute', onPress: () => useSettingsStore.getState().setSyncFrequency(1) },
    { text: '5 minutes', onPress: () => useSettingsStore.getState().setSyncFrequency(5) },
    { text: '15 minutes', onPress: () => useSettingsStore.getState().setSyncFrequency(15) },
    { text: '30 minutes', onPress: () => useSettingsStore.getState().setSyncFrequency(30) },
    { text: '1 hour', onPress: () => useSettingsStore.getState().setSyncFrequency(60) },
    { text: 'Cancel', style: 'cancel' },
  ]);
};

const formatSyncTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SettingRow: React.FC<{
  title: string;
  subtitle?: string;
  value?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onPress: () => void;
}> = ({ title, subtitle, value, icon, destructive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.settingRow}>
    {icon}
    <View style={styles.settingText}>
      <Text style={[styles.settingTitle, destructive && styles.settingTitleDestructive]}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.settingValue}>
      {value && <Text style={[styles.settingValueText, destructive && styles.settingValueDestructive]}>{value}</Text>}
      <Ionicons name="chevron-forward-outline" size={20} color={colors.text.tertiary} />
    </View>
  </TouchableOpacity>
);

const SettingToggle: React.FC<{
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ title, subtitle, value, onChange }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border.medium, true: colors.primary[500] }}
      thumbColor={colors.neutral[0]}
    />
  </View>
);

const Divider: React.FC = () => (
  <View style={styles.divider} />
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  profileCard: {
    backgroundColor: 'linear-gradient(135deg, #1E2D4D 0%, #0A1628 100%)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  settingTitleDestructive: {
    color: colors.error,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValueText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  settingValueDestructive: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  logoutSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});