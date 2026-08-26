import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAiConfigStore } from '@/store/aiConfigStore';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [verify, setVerify] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [agree, setAgree] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const isConfigured = useAiConfigStore(s => (s.provider === 'gemini' ? !!s.geminiKey : !!s.openaiKey));

  const onCreate = () => {
    if (!name.trim() || !email.trim() || !pass.trim()) { Alert.alert('Required', 'Fill all fields'); return; }
    if (pass !== verify) { Alert.alert('Mismatch', 'Security keys do not match'); return; }
    if (!agree) { Alert.alert('Policy', 'Agree to Privacy Policy'); return; }
    if (pass.length < 4) { Alert.alert('Weak key', 'Use at least 4 characters'); return; }
    const user: any = {
      id: `u_${Date.now()}`, email: email.trim(), name: name.trim(), household_id: `h_${Date.now()}`, created_at: new Date().toISOString(),
      preferences: { carbon_budget_monthly_kg: 200, energy_target_kwh_monthly: 400, food_waste_target_kg_monthly: 3.5, notifications_enabled: true, units: 'metric', theme: 'system' },
    };
    const tokens: any = { access_token: 'local_' + Date.now(), refresh_token: 'local_refresh', token_type: 'Bearer', expires_in: 86400 * 30 };
    setAuth(user, tokens);
    if (!isConfigured) router.replace('/api-setup' as any);
    else router.replace('/' as any);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.headRow}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={20} color="#0A0A0A" /></Pressable><View style={s.brandRow}><View style={s.logoCircle}><Text style={s.logoText}>🌿</Text></View><Text style={s.brandTitle}>Sustainability Hub</Text></View><View style={{ width: 32 }} /></View>

      <View style={s.heroImg}><View style={s.heroPlaceholder}><Ionicons name="leaf-outline" size={28} color="#9CA3AF" /></View><View style={s.newReg}><Text style={s.newRegText}>NEW REGISTRY</Text></View></View>

      <Text style={s.title}>CREATE IDENTITY</Text>
      <Text style={s.sub}>Join the precision environmental monitoring network.</Text>

      <Text style={s.label}>LEGAL FULL NAME</Text>
      <View style={s.inputWrap}><Ionicons name="person-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="e.g. Alex Rivers" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} /></View>

      <Text style={s.label}>PRIMARY DATA EMAIL</Text>
      <View style={s.inputWrap}><Ionicons name="mail-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="name@organization.com" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></View>

      <Text style={s.label}>SECURITY KEY</Text>
      <View style={s.inputWrap}><Ionicons name="lock-closed-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#9CA3AF" value={pass} onChangeText={setPass} secureTextEntry={!show1} /><Pressable onPress={() => setShow1(!show1)}><Ionicons name={show1 ? 'eye-off-outline' : 'eye-outline'} size={16} color="#6B7280" /></Pressable></View>

      <Text style={s.label}>VERIFY SECURITY KEY</Text>
      <View style={s.inputWrap}><Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#9CA3AF" value={verify} onChangeText={setVerify} secureTextEntry={!show2} /><Pressable onPress={() => setShow2(!show2)}><Ionicons name={show2 ? 'eye-off-outline' : 'eye-outline'} size={16} color="#6B7280" /></Pressable></View>

      <Pressable style={s.checkRow} onPress={() => setAgree(!agree)}><View style={[s.checkBox, agree && s.checkBoxActive]}>{agree && <Ionicons name="checkmark" size={12} color="#fff" />}</View><Text style={s.checkText}>I agree to the <Text style={s.link}>Environmental Privacy Policy</Text> and understand my data will be used for precision ecological auditing.</Text></Pressable>

      <Pressable style={[s.blackBtn, (!name || !email || !pass || !agree) && { opacity: 0.6 }]} onPress={onCreate}><Text style={s.blackText}>CREATE ACCOUNT</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></Pressable>

      <View style={s.dividerRow}><View style={s.line} /><Text style={s.dividerText}>EXISTING MEMBER</Text><View style={s.line} /></View>
      <Text style={s.existingSub}>Already have an active identity?</Text>
      <Pressable style={s.outlineBtn} onPress={() => router.replace('/login' as any)}><Text style={s.outlineText}>SECURE LOGIN</Text></Pressable>

      <View style={s.privacyCard}><View style={s.privIcon}><Ionicons name="shield-checkmark-outline" size={18} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.privTitle}>Privacy First Encryption</Text><Text style={s.privSub}>All environmental telemetry is end-to-end encrypted. We comply with global ISO 14001 sustainability data standards.</Text></View></View>

      <Text style={s.footer}>SUSTAINABILITY HUB © 2024 · IDP-CORE V4.2</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 10, paddingBottom: 28, paddingTop: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 14 },
  brandTitle: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  heroImg: { height: 120, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  heroPlaceholder: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  newReg: { position: 'absolute', left: 10, top: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  newRegText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.3, marginTop: 4 },
  sub: { fontSize: 12, color: '#6B7280', marginTop: -6 },
  label: { fontSize: 10, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.6, marginTop: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#F9FAFA', height: 44 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  checkRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  checkBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkBoxActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  checkText: { flex: 1, fontSize: 11, lineHeight: 16, color: '#6B7280' },
  link: { color: '#0A0A0A', fontWeight: '700', textDecorationLine: 'underline' },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  blackText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  existingSub: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  outlineBtn: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFFFFF' },
  outlineText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  privacyCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA', marginTop: 4 },
  privIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  privTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  privSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  footer: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.8, marginTop: 8 },
});
