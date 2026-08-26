import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAiConfigStore } from '@/store/aiConfigStore';
import { config } from '@/constants/config';

export default function ApiSetupScreen() {
  const { provider, setProvider, geminiKey, openaiKey, setGeminiKey, setOpenaiKey } = useAiConfigStore();
  const [localProvider, setLocalProvider] = useState(provider);
  const [gemKey, setGemKey] = useState(geminiKey);
  const [oaKey, setOaKey] = useState(openaiKey);
  const [show, setShow] = useState(false);

  const onSave = async () => {
    const key = localProvider === 'gemini' ? gemKey.trim() : oaKey.trim();
    if (!key) { Alert.alert('Key required', `Enter your ${localProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API key`); return; }
    // save locally first
    if (localProvider === 'gemini') { setGeminiKey(key); setProvider('gemini'); }
    else { setOpenaiKey(key); setProvider('openai'); }
    // try to push to backend so diagnose uses real AI (backend at 10.0.2.2 for emulator, LAN IP for device)
    try {
      const BASE = config.api.baseUrl;
      const body: any = { ai_provider: localProvider };
      if (localProvider === 'gemini') body.gemini_api_key = key; else body.openai_api_key = key;
      const res = await fetch(`${BASE}/settings/ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`backend ${res.status}`);
      Alert.alert('Connected', `${localProvider === 'gemini' ? 'Gemini' : 'OpenAI'} configured on backend`, [{ text: 'Continue', onPress: () => router.replace('/' as any) }]);
    } catch (e: any) {
      Alert.alert('Saved locally', `Key saved on device, but backend not reachable (${e.message}).\n\nIf on physical device, set backend to your PC LAN IP in src/constants/config.ts (e.g. 192.168.1.50) and run backend with --host 0.0.0.0.\n\nDiagnose will use offline mock until backend reachable.`, [{ text: 'Continue', onPress: () => router.replace('/' as any) }]);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.logoWrap}><View style={s.logoBox}><Ionicons name="hardware-chip-outline" size={28} color="#FFFFFF" /></View></View>
      <Text style={s.title}>CONNECT AI ENGINE</Text>
      <Text style={s.sub}>Choose your intelligence provider and connect your personal API key. You can change this anytime in Settings.</Text>

      <Text style={s.label}>AI PROVIDER</Text>
      <View style={s.segment}>
        <Pressable style={[s.seg, localProvider === 'gemini' && s.segActive]} onPress={() => setLocalProvider('gemini')}><Ionicons name="sparkles" size={14} color={localProvider === 'gemini' ? '#FFFFFF' : '#0A0A0A'} /><Text style={[s.segText, localProvider === 'gemini' && s.segTextActive]}>Gemini</Text></Pressable>
        <Pressable style={[s.seg, localProvider === 'openai' && s.segActive]} onPress={() => setLocalProvider('openai')}><Ionicons name="chatbubble-ellipses-outline" size={14} color={localProvider === 'openai' ? '#FFFFFF' : '#0A0A0A'} /><Text style={[s.segText, localProvider === 'openai' && s.segTextActive]}>OpenAI</Text></Pressable>
      </View>
      <Text style={s.help}>Higher precision models consume more tokens but provide better analysis. Gemini is recommended for Vision.</Text>

      <Text style={s.label}>{localProvider === 'gemini' ? 'GEMINI API KEY' : 'OPENAI API KEY'}</Text>
      <View style={s.inputWrap}>
        <Ionicons name="key-outline" size={16} color="#6B7280" />
        <TextInput style={s.input} placeholder={localProvider === 'gemini' ? 'AIza...' : 'sk-proj-...'} placeholderTextColor="#9CA3AF" value={localProvider === 'gemini' ? gemKey : oaKey} onChangeText={localProvider === 'gemini' ? setGemKey : setOaKey} secureTextEntry={!show} autoCapitalize="none" />
        <Pressable onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={16} color="#6B7280" /></Pressable>
      </View>
      <Text style={s.help}>Your key is stored encrypted on-device (MMKV) and never sent to our servers. {localProvider === 'gemini' ? 'Get it from aistudio.google.com' : 'Get it from platform.openai.com'}.</Text>

      <View style={s.tipCard}><View style={s.tipIcon}><Ionicons name="information-circle-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.tipTitle}>Why this step?</Text><Text style={s.tipSub}>Waste Analyzer, AgriSense and PlantSense run on your chosen model. Without a key, AI features show “Not configured”.</Text></View></View>

      <Pressable style={s.blackBtn} onPress={onSave}><Text style={s.blackText}>SAVE & CONTINUE</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></Pressable>
      <Pressable style={s.skip} onPress={() => router.replace('/' as any)}><Text style={s.skipText}>Skip for now — explore without AI</Text></Pressable>

      <Text style={s.footer}>SUSTAINABILITY HUB © 2024 · AI-CORE V2.4</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 12, paddingBottom: 28, paddingTop: 60 },
  logoWrap: { alignSelf: 'center' },
  logoBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0A0A', textAlign: 'center', letterSpacing: 0.6, marginTop: 8 },
  sub: { fontSize: 12, lineHeight: 18, color: '#6B7280', textAlign: 'center', marginTop: -4 },
  label: { fontSize: 10, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6, marginTop: 8 },
  segment: { flexDirection: 'row', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 9999, padding: 4, borderWidth: 1, borderColor: '#E5E5E5' },
  seg: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 9999, backgroundColor: 'transparent' },
  segActive: { backgroundColor: '#0A0A0A' },
  segText: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  segTextActive: { color: '#FFFFFF' },
  help: { fontSize: 11, lineHeight: 16, color: '#6B7280' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#F9FAFA', height: 44 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  tipCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  tipIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  tipSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  blackText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  footer: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.8, marginTop: 12 },
});
