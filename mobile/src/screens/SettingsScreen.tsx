// mobile/src/screens/SettingsScreen.tsx
import React from 'react';
import { ScrollView, Alert, Switch } from 'react-native';
import { Stack, Text, Button, Card, Badge, Avatar } from '@/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { config } from '@/constants/config';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

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
      <Card variant="elevated" padding="lg" style={styles.profileCard}>
        <Stack flexDirection="row" alignItems="center" gap="4" marginBottom="lg">
          <Avatar size="xl" name={user?.name || 'User'} source={user?.avatar ? { uri: user.avatar } : undefined} status="online" />
          <Stack flex={1}>
            <Text fontSize="24" fontWeight="800" color="#F8FAFC">{user?.name || 'User'}</Text>
            <Text fontSize="8" color="#CBD5E1">{user?.email || 'email@example.com'}</Text>
          </Stack>
        </Stack>
        <Stack flexDirection="row" justifyContent="space-around" paddingTop="lg" borderTopWidth={1} borderTopColor="#334155">
          <StatItem label="Carbon" value="187 kg" />
          <StatItem label="Energy" value="423 kWh" />
          <StatItem label="Waste" value="4.2 kg" />
        </Stack>
      </Card>

      {/* Preferences */}
      <Section title="Targets & Preferences">
        <Card>
          <SettingRow
            title="Monthly Carbon Budget"
            subtitle="Target kg COâ‚‚e per month"
            value={`${preferences.carbon_budget_monthly_kg} kg`}
            icon={<Ionicons name="leaf" size={22} color="#22C55E" />}
            onPress={() => showNumberInput('Carbon Budget', 'carbon_budget_monthly_kg', preferences.carbon_budget_monthly_kg)}
          />
          <Divider />
          <SettingRow
            title="Monthly Energy Target"
            subtitle="Target kWh per month"
            value={`${preferences.energy_target_kwh_monthly} kWh`}
            icon={<Ionicons name="flash" size={22} color="#F59E0B" />}
            onPress={() => showNumberInput('Energy Target', 'energy_target_kwh_monthly', preferences.energy_target_kwh_monthly)}
          />
          <Divider />
          <SettingRow
            title="Monthly Food Waste Target"
            subtitle="Target kg of avoidable waste"
            value={`${preferences.food_waste_target_kg_monthly} kg`}
            icon={<Ionicons name="restaurant" size={22} color="#EF4444" />}
            onPress={() => showNumberInput('Waste Target', 'food_waste_target_kg_monthly', preferences.food_waste_target_kg_monthly)}
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
            icon={<MaterialIcons name="palette" size={22} color="#0EA5E9" />}
            onPress={showThemePicker}
          />
          <Divider />
          <SettingRow
            title="Units"
            subtitle="Measurement system"
            value={units === 'metric' ? 'Metric (kg, kWh, Â°C)' : 'Imperial (lbs, kWh, Â°F)'}
            icon={<Ionicons name="swap-horizontal" size={22} color="#0EA5E9" />}
            onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          />
        </Card>
      </Section>

      {/* Notifications */}
      <Section title="Notifications & Security">
        <Card>
          <SettingToggle
            title="Push Notifications"
            subtitle="Receive reminders and insights"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
            icon={<Ionicons name="notifications" size={22} color="#22C55E" />}
          />
          <Divider />
          <SettingToggle
            title="Biometric Auth"
            subtitle="Use Face ID / Fingerprint"
            value={biometricEnabled}
            onChange={setBiometricEnabled}
            icon={<MaterialIcons name="fingerprint" size={22} color="#0EA5E9" />}
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
            icon={<Ionicons name="sync" size={22} color="#22C55E" />}
          />
          <Divider />
          <SettingRow
            title="Sync Frequency"
            subtitle="How often to sync"
            value={`${syncFrequency} minutes`}
            icon={<Ionicons name="timer" size={22} color="#F59E0B" />}
            onPress={showSyncFrequencyPicker}
          />
          <Divider />
          <SettingToggle
            title="Data Saver Mode"
            subtitle="Reduce data usage on mobile"
            value={dataSaverMode}
            onChange={setDataSaverMode}
            icon={<Ionicons name="wifi" size={22} color="#0EA5E9" />}
          />
          <Divider />
          <SettingRow
            title="Last Sync"
            subtitle={lastSyncAt ? formatSyncTime(lastSyncAt) : 'Never synced'}
            value="Tap to sync now"
            icon={<Ionicons name="cloud-download" size={22} color="#0EA5E9" />}
            onPress={fetchStatus}
          />
        </Card>
      </Section>

      {/* Account */}
      <Section title="Account">
        <Card>
          <SettingRow
            title="Edit Profile"
            subtitle="Name, email, password"
            icon={<Ionicons name="person" size={22} color="#22C55E" />}
            onPress={() => router.push('/settings/profile')}
          />
          <Divider />
          <SettingRow
            title="Household"
            subtitle="Manage members and settings"
            icon={<Ionicons name="people" size={22} color="#0EA5E9" />}
            onPress={() => router.push('/settings/household')}
          />
          <Divider />
          <SettingRow
            title="Export Data"
            subtitle="Download your data as CSV/JSON"
            icon={<Ionicons name="download" size={22} color="#F59E0B" />}
            onPress={() => Alert.alert('Export', 'Feature coming soon')}
          />
          <Divider />
          <SettingRow
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon={<Ionicons name="trash" size={22} color="#EF4444" />}
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
            subtitle={`${config.app.version} (Build ${config.app.buildNumber})`}
            icon={<Ionicons name="information-circle" size={22} color="#0EA5E9" />}
          />
          <Divider />
          <SettingRow
            title="Privacy Policy"
            icon={<Ionicons name="document-text" size={22} color="#0EA5E9" />}
            onPress={() => Alert.alert('Privacy Policy', config.app.privacyUrl)}
          />
          <Divider />
          <SettingRow
            title="Terms of Service"
            icon={<Ionicons name="document-text" size={22} color="#0EA5E9" />}
            onPress={() => Alert.alert('Terms of Service', config.app.termsUrl)}
          />
          <Divider />
          <SettingRow
            title="Contact Support"
            subtitle={config.app.supportEmail}
            icon={<Ionicons name="mail" size={22} color="#22C55E" />}
            onPress={() => Alert.alert('Support', config.app.supportEmail)}
          />
        </Card>
      </Section>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button variant="danger" fullWidth onPress={handleLogout}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="log-out" size={20} />
            <Text>Logout</Text>
          </Stack>
        </Button>
      </View>
    </ScrollView>
  );
};

const showNumberInput = (title: string, key: string, currentValue: number) => {
  Alert.alert(
    title,
    `Current: ${currentValue}`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: '+10', onPress: () => useSettingsStore.getState().setPreferences({ [key]: currentValue + 10 }) },
      { text: '+50', onPress: () => useSettingsStore.getState().setPreferences({ [key]: currentValue + 50 }) },
      { text: 'Reset', onPress: () => useSettingsStore.getState().setPreferences({ [key]: key.includes('carbon') ? 200 : key.includes('energy') ? 400 : 3.5 }) },
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

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SettingRow = ({ title, subtitle, value, icon, destructive, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.settingRow}>
    {icon && <Stack marginRight={16}>{icon}</Stack>}
    <Stack flex={1}>
      <Text style={[styles.settingTitle, destructive && styles.settingTitleDestructive]}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </Stack>
    <Stack flexDirection="row" alignItems="center" gap="2">
      {value && <Text style={[styles.settingValueText, destructive && styles.settingValueDestructive]}>{value}</Text>}
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </Stack>
  </TouchableOpacity>
);

const SettingToggle = ({ title, subtitle, value, onChange, icon }: any) => (
  <View style={styles.settingRow}>
    {icon && <Stack marginRight={16}>{icon}</Stack>}
    <Stack flex={1}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </Stack>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#334155', true: '#22C55E' }}
      thumbColor="#0A1628"
    />
  </View>
);

const Divider = () => <View style={styles.divider} />;

const StatItem = ({ label, value }: any) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = {
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  section: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  profileCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  settingTitle: { fontSize: 16, color: '#F8FAFC', fontWeight: '500' },
  settingTitleDestructive: { color: '#EF4444' },
  settingSubtitle: { fontSize: 13, color: '#CBD5E1', marginTop: 4 },
  settingValueText: { fontSize: 16, color: '#CBD5E1' },
  settingValueDestructive: { color: '#EF4444' },
  divider: { height: 1, backgroundColor: '#334155', marginHorizontal: 16 },
  logoutSection: { marginTop: 24, paddingHorizontal: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  statLabel: { fontSize: 11, color: '#CBD5E1' },
};