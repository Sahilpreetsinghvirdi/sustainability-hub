import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { config } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [apiKey, setApiKey] = useState('sk-proj-7x923kLpQ8...R3z');
  const [showKey, setShowKey] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(true);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Profile */}
      <View style={s.profileCard}>
        <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>Alex Rivers</Text>
          <Text style={s.role}>Eco-Conscious Voyager</Text>
          <View style={s.idPill}><Text style={s.idText}>ID: SH-88219</Text></View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#0A0A0A" />
      </View>

      {/* AI Engine & Configuration */}
      <View style={s.secHead}><Ionicons name="hardware-chip-outline" size={16} color="#0A0A0A" /><Text style={s.secTitle}>AI ENGINE & CONFIGURATION</Text></View>
      <View style={s.groupCard}>
        <Text style={s.groupKicker}>PRIMARY WASTE ANALYSIS MODEL</Text>
        <View style={s.dropdown}><Text style={s.dropdownText}>GPT-4 Turbo (Precise)</Text><View style={s.dropIcons}><Ionicons name="chevron-down" size={14} color="#0A0A0A" /><Ionicons name="checkmark" size={14} color="#0A0A0A" /></View></View>
        <Text style={s.help}>Higher precision models consume more tokens but provide better waste classification.</Text>
        <View style={s.keyHead}><Text style={s.groupKicker}>PERSONAL API KEY</Text><Text style={s.encrypted}>ENCRYPTED</Text></View>
        <View style={s.keyRow}><TextInput style={s.keyInput} value={showKey ? apiKey : 'sk-proj-7x923kLpQ8...R3z'} secureTextEntry={!showKey} editable={false} /><Pressable onPress={() => setShowKey(!showKey)} style={s.eye}><Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={16} color="#0A0A0A" /></Pressable></View>
        <View style={s.btnRow}><Pressable style={s.outlineBtn} onPress={() => Alert.alert('Verify', 'Key verified')}><Text style={s.outlineText}>Verify Key</Text></Pressable><Pressable style={s.outlineBtn} onPress={() => setApiKey('')}><Text style={s.outlineText}>Reset</Text></Pressable></View>
      </View>

      {/* Management */}
      <View style={s.secHead}><Ionicons name="settings-outline" size={16} color="#0A0A0A" /><Text style={s.secTitle}>MANAGEMENT</Text></View>
      <Pressable style={s.accordion} onPress={() => router.push('/settings/profile' as any)}>
        <View style={s.accIcon}><Ionicons name="person-outline" size={14} color="#0A0A0A" /></View>
        <View style={{ flex: 1 }}><Text style={s.accTitle}>Account Information</Text><Text style={s.accSub}>Email, password, and public name</Text></View>
        <Ionicons name="chevron-down" size={16} color="#0A0A0A" />
      </Pressable>

      <View style={[s.accordion, { flexDirection: 'column', alignItems: 'stretch' }]}>
        <Pressable style={s.accHeadRow} onPress={() => setHouseholdOpen(!householdOpen)}>
          <View style={s.accIcon}><Ionicons name="home-outline" size={14} color="#0A0A0A" /></View>
          <View style={{ flex: 1 }}><Text style={s.accTitle}>Household Settings</Text><Text style={s.accSub}>Manage members and location type</Text></View>
          <Ionicons name={householdOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#0A0A0A" />
        </Pressable>
        {householdOpen && (
          <View style={s.householdBody}>
            <View style={s.locationCard}>
              <View><Text style={s.locationKicker}>Location Type</Text><Text style={s.locationValue}>Detached Single Family</Text></View>
              <Pressable style={s.changePill}><Text style={s.changeText}>Change</Text></Pressable>
            </View>
            <Text style={s.occupants}>Occupants</Text>
            <View style={s.occupantRow}>
              <View style={s.occupantIcon}><Ionicons name="home" size={14} color="#9CA3AF" /></View>
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={s.occupantAvatar} />
              <View style={s.addOccupant}><Ionicons name="add" size={16} color="#0A0A0A" /></View>
            </View>
          </View>
        )}
      </View>

      <Pressable style={s.accordion} onPress={() => Alert.alert('Notifications', 'Alerts settings')}>
        <View style={s.accIcon}><Ionicons name="notifications-outline" size={14} color="#0A0A0A" /></View>
        <View style={{ flex: 1 }}><Text style={s.accTitle}>Notification Preferences</Text><Text style={s.accSub}>Alerts, reports, and reminders</Text></View>
        <Ionicons name="chevron-down" size={16} color="#0A0A0A" />
      </Pressable>
      <Pressable style={s.accordion} onPress={() => Alert.alert('Privacy', 'Data settings')}>
        <View style={s.accIcon}><Ionicons name="shield-checkmark-outline" size={14} color="#0A0A0A" /></View>
        <View style={{ flex: 1 }}><Text style={s.accTitle}>Data & Privacy</Text><Text style={s.accSub}>Control your data visibility and footprint</Text></View>
        <Ionicons name="chevron-down" size={16} color="#0A0A0A" />
      </Pressable>

      <Pressable style={s.rowCard} onPress={() => Alert.alert('Security', 'Security settings')}>
        <View style={s.accIcon}><Ionicons name="key-outline" size={14} color="#0A0A0A" /></View>
        <Text style={s.accTitle}>Security & Session</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="chevron-forward" size={14} color="#0A0A0A" />
      </Pressable>

      <Pressable style={s.signOut} onPress={() => Alert.alert('Sign out', 'Sign out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: logout }])}>
        <Ionicons name="log-out-outline" size={16} color="#0A0A0A" />
        <Text style={s.signOutText}>SIGN OUT OF DEVICE</Text>
      </Pressable>

      <Text style={s.footer}>SUSTAINABILITY HUB V2.4.0-MONOCHROME</Text>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  profileCard: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, backgroundColor: '#F9FAFA' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAEAEA' },
  name: { fontSize: 15, fontWeight: '800', color: '#0A0A0A' },
  role: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  idPill: { marginTop: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#FFFFFF' },
  idText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  secHead: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 },
  secTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  groupCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, gap: 10, backgroundColor: '#F9FAFA' },
  groupKicker: { fontSize: 10, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  dropdownText: { fontSize: 12, fontWeight: '600', color: '#0A0A0A' },
  dropIcons: { flexDirection: 'row', gap: 6 },
  help: { fontSize: 10, lineHeight: 14, color: '#6B7280' },
  keyHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  encrypted: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  keyRow: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  keyInput: { flex: 1, fontSize: 12, color: '#0A0A0A', paddingVertical: 10 },
  eye: { padding: 4 },
  btnRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingVertical: 10, alignItems: 'center', backgroundColor: '#FFFFFF' },
  outlineText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  accordion: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  accIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  accTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  accSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  accHeadRow: { flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' },
  householdBody: { marginTop: 12, gap: 10, width: '100%' },
  locationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 10, backgroundColor: '#FFFFFF' },
  locationKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  locationValue: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', marginTop: 2 },
  changePill: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#F9FAFA' },
  changeText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  occupants: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', marginTop: 4 },
  occupantRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  occupantIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  occupantAvatar: { width: 32, height: 32, borderRadius: 16 },
  addOccupant: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  rowCard: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  signOut: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  signOutText: { fontSize: 12, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  footer: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.8, marginTop: 8 },
});
