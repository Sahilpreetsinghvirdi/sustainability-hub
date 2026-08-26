import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export const SettingsProfileScreen: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [name, setName] = useState(user?.name || 'Alex Rivers');
  const [email, setEmail] = useState(user?.email || 'alex.rivers@eco-hub.com');
  const [region, setRegion] = useState('Brooklyn, New York, USA');

  const onSave = () => {
    updateUser({ name: name.trim(), email: email.trim() } as any);
    Alert.alert('Saved', 'Profile updated', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.headRow}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={18} color="#0A0A0A" /></Pressable><View style={{ width: 32 }} /></View>

      <View style={s.avatarWrap}>
        <View style={s.avatarCircle}>
          {(user as any)?.avatar ? <Image source={{ uri: (user as any).avatar }} style={s.avatarImg} /> : <View style={s.avatarSilhouette}><Ionicons name="person" size={48} color="#FFFFFF" /></View>}
          <Pressable style={s.camBadge} onPress={() => router.push('/settings/avatar' as any)}><Ionicons name="camera-outline" size={14} color="#FFFFFF" /></Pressable>
        </View>
        <Text style={s.name}>{name.toUpperCase()}</Text>
        <Text style={s.rank}>Eco-Guardian Rank: Platinum</Text>
      </View>

      <View style={s.kickerRow}><Ionicons name="person-outline" size={12} color="#0A0A0A" /><Text style={s.kicker}>PERSONAL METADATA</Text></View>

      <View style={s.card}>
        <Text style={s.label}>FULL IDENTIFICATION NAME</Text>
        <View style={s.inputWrap}><Ionicons name="person-outline" size={16} color="#6B7280" /><TextInput style={s.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#9CA3AF" /></View>
        <Text style={s.label}>VERIFIED CONTACT ADDRESS</Text>
        <View style={s.inputWrap}><Ionicons name="mail-outline" size={16} color="#6B7280" /><TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="email" placeholderTextColor="#9CA3AF" autoCapitalize="none" /><View style={s.verified}><Text style={s.verifiedText}>VERIFIED</Text></View></View>
        <Text style={s.label}>SUSTAINABILITY REGION</Text>
        <View style={s.inputWrap}><Ionicons name="location-outline" size={16} color="#6B7280" /><TextInput style={s.input} value={region} onChangeText={setRegion} placeholder="Region" placeholderTextColor="#9CA3AF" /></View>
      </View>

      <View style={s.kickerRow}><Ionicons name="shield-checkmark-outline" size={12} color="#0A0A0A" /><Text style={s.kicker}>ACCOUNT REGISTRY</Text></View>
      <View style={s.row}>
        <View style={s.regCard}><Text style={s.regKicker}>USER ID</Text><Text style={s.regValue}>SH-88219-PRO</Text></View>
        <View style={s.regCard}><Text style={s.regKicker}>MEMBER SINCE</Text><Text style={s.regValue}>JAN 2024</Text></View>
      </View>

      <View style={s.sessionCard}><View style={s.sessionIcon}><Ionicons name="time-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.sessionTitle}>Session Data Persistence</Text><Text style={s.sessionSub}>Your profile metadata is encrypted and synced across all Hub-enabled devices. Updates may take 1-2 minutes to propagate.</Text></View></View>

      <Pressable style={s.saveBtn} onPress={onSave}><Ionicons name="save-outline" size={16} color="#fff" /><Text style={s.saveText}>SAVE CHANGES</Text></Pressable>
      <Pressable style={s.discard} onPress={() => router.back()}><Ionicons name="chevron-back" size={12} color="#6B7280" /><Text style={s.discardText}>Discard and return to Settings</Text></Pressable>

      <Text style={s.footer}>PROFILE REGISTRY PROTOCOL V2.4.1</Text>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  avatarSilhouette: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  camBadge: { position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#0A0A0A', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '900', color: '#0A0A0A', letterSpacing: 0.4 },
  rank: { fontSize: 11, color: '#6B7280', marginTop: -4 },
  kickerRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 },
  kicker: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  card: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, gap: 10, backgroundColor: '#F9FAFA' },
  label: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF', height: 44 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  verified: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  verifiedText: { fontSize: 9, fontWeight: '800', color: '#0A0A0A' },
  row: { flexDirection: 'row', gap: 10 },
  regCard: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA', gap: 4 },
  regKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  regValue: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  sessionCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  sessionIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  sessionTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  sessionSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  saveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  discard: { flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  discardText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  footer: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.8, marginTop: 8 },
});
