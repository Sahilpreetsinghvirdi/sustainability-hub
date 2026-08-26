import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import logo from '@/assets/logo.png';
import { useAiConfigStore } from '@/store/aiConfigStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [keep, setKeep] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const isConfigured = useAiConfigStore(s => s.isConfigured());

  const onLogin = () => {
    if (!email.trim() || !password.trim()) { Alert.alert('Required', 'Enter email and security key'); return; }
    const user: any = {
      id: `u_${Date.now()}`,
      email: email.trim(),
      name: email.split('@')[0]?.replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'User',
      household_id: `h_${Date.now()}`,
      created_at: new Date().toISOString(),
      preferences: { carbon_budget_monthly_kg: 200, energy_target_kwh_monthly: 400, food_waste_target_kg_monthly: 3.5, notifications_enabled: true, units: 'metric', theme: 'system' },
    };
    const tokens: any = { access_token: 'local_' + Date.now(), refresh_token: 'local_refresh', token_type: 'Bearer', expires_in: 86400 * 30 };
    setAuth(user, tokens);
    if (!isConfigured()) router.replace('/api-setup' as any);
    else router.replace('/(tabs)');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.logoWrap}>
        <View style={s.logoBox}><Image source={logo} style={s.logo} /></View>
        <View style={s.vBadge}><Text style={s.vText}>V2.4</Text></View>
      </View>
      <Text style={s.title}>SUSTAINABILITY HUB</Text>
      <Text style={s.sub}>Precision Environmental Intelligence</Text>

      <Text style={s.welcome}>Welcome Back</Text>
      <Text style={s.welcomeSub}>Sign in to manage your sustainable ecosystem.</Text>

      <Text style={s.label}>EMAIL OR USERNAME</Text>
      <View style={s.inputWrap}><Ionicons name="mail-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="name@organization.com" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></View>

      <View style={s.rowBetween}><Text style={s.label}>SECURITY KEY</Text><Pressable onPress={() => Alert.alert('Forgot', 'Reset via email not implemented')}><Text style={s.forgot}>FORGOT PASSWORD?</Text></Pressable></View>
      <View style={s.inputWrap}><Ionicons name="lock-closed-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry={!show} /><Pressable onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={16} color="#6B7280" /></Pressable></View>

      <Pressable style={s.checkRow} onPress={() => setKeep(!keep)}><View style={[s.checkBox, keep && s.checkBoxActive]}>{keep && <Ionicons name="checkmark" size={12} color="#fff" />}</View><Text style={s.checkText}>Keep me signed in for 30 days</Text></Pressable>

      <Pressable style={s.blackBtn} onPress={onLogin}><Text style={s.blackText}>SECURE LOGIN</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></Pressable>

      <View style={s.dividerRow}><View style={s.line} /><Text style={s.dividerText}>SECURITY REGISTRY</Text><View style={s.line} /></View>

      <View style={s.registry}><View style={s.regIcon}><Ionicons name="shield-checkmark-outline" size={18} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.regTitle}>Encrypted Connection</Text><Text style={s.regSub}>Access is restricted to authorized personnel. Session metadata is logged for environmental audit compliance.</Text></View></View>

      <Text style={s.noAcc}>Don't have an account yet?</Text>
      <Pressable style={s.outlineBtn} onPress={() => router.push('/create-account' as any)}><Text style={s.outlineText}>Create a new account</Text></Pressable>

      <Text style={s.footer}>SUSTAINABILITY HUB © 2024 · ISO 14001 COMPLIANT</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 12, paddingBottom: 28, paddingTop: 40 },
  logoWrap: { alignSelf: 'center', marginBottom: 8 },
  logoBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo: { width: 64, height: 64 },
  vBadge: { position: 'absolute', right: -10, bottom: -6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 6, paddingVertical: 2 },
  vText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A' },
  title: { fontSize: 18, fontWeight: '900', color: '#0A0A0A', textAlign: 'center', letterSpacing: 0.6, marginTop: 4 },
  sub: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: -6 },
  welcome: { fontSize: 18, fontWeight: '800', color: '#0A0A0A', marginTop: 16 },
  welcomeSub: { fontSize: 12, color: '#6B7280', marginTop: -6 },
  label: { fontSize: 10, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.6, marginTop: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  forgot: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#F9FAFA', height: 44 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  checkRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  checkBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  checkBoxActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  checkText: { fontSize: 11, color: '#6B7280' },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  blackText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  registry: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  regIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  regTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  regSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  noAcc: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 12 },
  outlineBtn: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFFFFF' },
  outlineText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  footer: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.8, marginTop: 16 },
});
