import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeFertilizer, getAgriHistory } from '@/services/ai';
import { useAiConfigStore } from '@/store/aiConfigStore';

export default function AgriSenseScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => { getAgriHistory().then(setHistory).catch(() => null); }, []);
  const pick = async (cam: boolean) => {
    const perm = cam ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = cam ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) setImageUri(res.assets[0].uri);
  };
  const run = async () => {
    if (!imageUri) { Alert.alert('No image', 'Capture or pick a fertilizer photo'); return; }
    if (!crop.trim()) { Alert.alert('Crop required', 'Enter crop name'); return; }
    setAnalyzing(true);
    try {
      const out = await analyzeFertilizer(imageUri, { crop });
      setResult(out);
      try { const { saveAgriHistory } = await import('@/services/ai'); await saveAgriHistory({ id: `ag_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: out, crop }); } catch {}
    } catch (e: any) {
      const hasKey = useAiConfigStore.getState().provider === 'gemini' ? !!useAiConfigStore.getState().geminiKey : !!useAiConfigStore.getState().openaiKey;
      const mock: any = {
        summary: `${crop} — offline analysis: suitable with standard dosage. Monitor soil pH around 6.5.`,
        product_identification: { name: crop + ' Fertilizer', type: 'NPK', confidence: 0.88, description: 'Balanced nutrient fertilizer' },
        nutrient_profile: { npk: '10-10-10', ph_effect: 'neutral', micronutrients: ['Zn','Fe'] },
        verdict: { suitability: 'suitable', score: 78, reasoning: 'Offline estimate — suitable for vegetative stage' },
        crop_fit: { suitable_for_current_crop: true, explanation: 'Suitable' },
        benefits: ['Balanced growth'],
        risks_cautions: ['Avoid over-application'],
        application_guidance: [{ title: 'Dosage', detail: '5g per liter, every 14 days' }],
        dosage: '5g/L',
        best_timing: 'Early morning',
        alternatives: [],
        environmental_notes: hasKey ? 'Provisional offline estimate — AI provider unreachable' : 'Offline — add API key for precise',
        recommendations: ['Test soil after 2 weeks'],
        analyzer_model: 'offline-mock',
        processing_time_ms: 700,
      };
      setResult(mock);
      try { const { saveAgriHistory } = await import('@/services/ai'); await saveAgriHistory({ id: `ag_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: mock, crop }); } catch {}
      if (hasKey) Alert.alert('AI provider unreachable', `Could not reach the AI provider (${e.message}). Check your internet connection and try again.`);
      else Alert.alert('Offline Mode', 'No API key configured — showing offline estimate. Add an API key in Settings for full AI.');
    } finally { setAnalyzing(false); }
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Top image */}
      <View style={s.imageWrap}>
        {imageUri ? <Image source={{ uri: imageUri }} style={s.topImg} /> : <View style={s.topPlaceholder}><Ionicons name="leaf" size={36} color="#0A0A0A" /><Text style={s.topPlaceholderText}>Plant in mug • Sensor Hub</Text></View>}
      </View>
      <Text style={s.title}>AGRISENSE CORE</Text>
      <Text style={s.sub}>Real-time subsurface monitoring and AI-driven soil health analysis.</Text>

      <View style={s.secHead}><View style={s.secIcon}><Ionicons name="layers-outline" size={12} color="#0A0A0A" /></View><Text style={s.secTitle}>AI PROVIDERS</Text><View style={s.pill}><Text style={s.pillText}>4 Active Nodes</Text></View></View>
      <View style={s.providerRow}><View style={s.providerIcon}><Ionicons name="wifi" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.providerKicker}>TERRAFORM AI</Text><Text style={s.providerValue}>Active</Text></View><Text style={s.providerMs}>12ms</Text></View>
      <View style={s.providerRow}><View style={s.providerIcon}><Ionicons name="sync" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.providerKicker}>NEURALCROP V4</Text><Text style={s.providerValue}>Syncing</Text></View><Text style={s.providerMs}>--</Text></View>
      <View style={s.providerRow}><View style={s.providerIcon}><Ionicons name="wifi" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.providerKicker}>AGRICOMPUTE CLOUD</Text><Text style={s.providerValue}>Active</Text></View><Text style={s.providerMs}>45ms</Text></View>

      <View style={s.secHead}><Ionicons name="pulse-outline" size={14} color="#0A0A0A" /><Text style={s.secTitle}>LIVING DATA</Text></View>
      <View style={s.livingGrid}>
        <View style={s.livingCard}><View style={s.livingIcon}><Ionicons name="water-outline" size={16} color="#FFFFFF" /></View><View style={s.livingBadge}><Text style={s.livingBadgeText}>+21%</Text></View><Text style={s.livingKicker}>SOIL MOISTURE</Text><Text style={s.livingValue}>42.8<Text style={s.livingUnit}> %</Text></Text></View>
        <View style={s.livingCard}><View style={[s.livingIcon, { backgroundColor: '#0A0A0A' }]}><Ionicons name="thermometer-outline" size={16} color="#FFFFFF" /></View><View style={[s.livingBadge, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5' }]}><Text style={{ fontSize: 10, fontWeight: '700', color: '#0A0A0A' }}>-0.5°</Text></View><Text style={s.livingKicker}>TEMPERATURE</Text><Text style={s.livingValue}>24.5<Text style={s.livingUnit}> °C</Text></Text></View>
        <View style={s.livingCard}><View style={s.livingIcon}><Ionicons name="flash-outline" size={16} color="#FFFFFF" /></View><Text style={s.livingKicker}>PH LEVELS</Text><Text style={s.livingValue}>6.8<Text style={s.livingUnit}> pH</Text></Text></View>
        <View style={s.livingCard}><View style={s.livingIcon}><Ionicons name="water-outline" size={16} color="#FFFFFF" /></View><View style={s.livingBadge}><Text style={s.livingBadgeText}>+12%</Text></View><Text style={s.livingKicker}>HUMIDITY</Text><Text style={s.livingValue}>58<Text style={s.livingUnit}> %</Text></Text></View>
      </View>

      <View style={s.healthCard}>
        <View style={s.healthHead}><View><Text style={s.healthTitle}>Soil Health Score</Text><Text style={s.healthSub}>Composite AI Assessment</Text></View><View style={s.scoreRing}><Text style={s.scoreText}>84</Text></View></View>
        <View style={s.npkRow}><Text style={s.npkLabel}>NITROGEN (N)</Text><Text style={s.npkBadge}>OPTIMAL</Text></View><View style={s.track}><View style={[s.fill, { width: '84%' }]} /></View>
        <View style={s.npkRow}><Text style={s.npkLabel}>PHOSPHORUS (P)</Text><Text style={s.npkBadge}>HIGH</Text></View><View style={s.track}><View style={[s.fill, { width: '92%' }]} /></View>
        <View style={s.npkRow}><Text style={s.npkLabel}>POTASSIUM (K)</Text><Text style={s.npkBadge}>MODERATE</Text></View><View style={s.track}><View style={[s.fill, { width: '62%' }]} /></View>
        <Pressable style={s.blackBtn} onPress={run} disabled={analyzing}>
          {analyzing ? <ActivityIndicator color="#fff" /> : <><Ionicons name="sparkles" size={16} color="#fff" /><Text style={s.blackBtnText}>REQUEST AI RECOMMENDATION</Text></>}
        </Pressable>
      </View>

      {/* Fertilizer scan inputs */}
      <View style={s.scanBox}>
        <Text style={s.scanTitle}>Fertilizer Scan</Text>
        <View style={s.pickRow}><Pressable style={s.pickBtn} onPress={() => pick(true)}><Ionicons name="camera" size={18} color="#0A0A0A" /><Text style={s.pickText}>Camera</Text></Pressable><Pressable style={s.pickBtn} onPress={() => pick(false)}><Ionicons name="images" size={18} color="#0A0A0A" /><Text style={s.pickText}>Gallery</Text></Pressable></View>
        <TextInput style={s.input} placeholder="Crop name *" placeholderTextColor="#9CA3AF" value={crop} onChangeText={setCrop} />
      </View>

      {result && <View style={s.resultCard}><Text style={s.resultTitle}>{result.product_identification?.name}</Text><Text style={s.resultText}>{result.summary}</Text></View>}

      <View style={s.secHead}><View style={s.secIcon}><Ionicons name="layers-outline" size={12} color="#0A0A0A" /></View><Text style={s.secTitle}>SYSTEM REGISTRY</Text><Text style={s.viewAll}>VIEW ALL</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        <View style={s.registryCard}><Text style={s.regKicker}>2H AGO</Text><Text style={s.regTitle}>Calibrated S-1</Text><View style={s.regSuccess}><View style={s.dot} /><Text style={s.regSuccessText}>Success</Text></View></View>
        <View style={s.registryCard}><Text style={s.regKicker}>5H AGO</Text><Text style={s.regTitle}>Data Backup</Text><View style={s.regSuccess}><View style={s.dot} /><Text style={s.regSuccessText}>Success</Text></View></View>
        <View style={s.registryCard}><Text style={s.regKicker}>1D AGO</Text><Text style={s.regTitle}>Update v2</Text><View style={s.regSuccess}><View style={s.dot} /><Text style={s.regSuccessText}>Success</Text></View></View>
      </ScrollView>

      <View style={s.bottomRow}>
        <Pressable style={s.bottomCard} onPress={() => pick(true)}><Text style={s.bottomKicker}>DIAGNOSTICS</Text><Text style={s.bottomValue}>Run Scan</Text><Ionicons name="information-circle-outline" size={16} color="#0A0A0A" style={{ position: 'absolute', right: 10, top: 10 }} /></Pressable>
        <Pressable style={s.bottomCard} onPress={async () => {
          try {
            const rows = [['timestamp','crop','soil_moisture','temperature','ph','humidity','health_score'],[new Date().toISOString(),'Living Data','42.8%','24.5°C','6.8','58%','84']];
            const csv = rows.map(r => r.join(',')).join('\n');
            const FileSystem = await import('expo-file-system');
            const uri = (FileSystem.cacheDirectory || '') + `agrisense_${Date.now()}.csv`;
            await FileSystem.writeAsStringAsync(uri, csv);
            Alert.alert('Exported', `CSV saved to cache:\n${uri}\n\n${csv}`);
          } catch (e: any) { Alert.alert('Export failed', e.message); }
        }}><Text style={s.bottomKicker}>EXPORT</Text><Text style={s.bottomValue}>CSV Data</Text><Ionicons name="chevron-forward" size={16} color="#0A0A0A" style={{ position: 'absolute', right: 10, top: 10 }} /></Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  imageWrap: { height: 180, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  topImg: { width: '100%', height: '100%' },
  topPlaceholder: { alignItems: 'center', gap: 8 },
  topPlaceholderText: { fontSize: 12, color: '#6B7280' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A0A0A', letterSpacing: -0.4 },
  sub: { fontSize: 12, lineHeight: 18, color: '#6B7280', marginTop: -8 },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  secIcon: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  secTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6, flex: 1 },
  pill: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#F9FAFA' },
  pillText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  providerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  providerKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  providerValue: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  providerMs: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  livingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  livingCard: { width: '48%', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, gap: 8, backgroundColor: '#F9FAFA', position: 'relative' },
  livingIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  livingBadge: { position: 'absolute', right: 10, top: 10, backgroundColor: '#0A0A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  livingBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  livingKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  livingValue: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  livingUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  healthCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 10, backgroundColor: '#F9FAFA' },
  healthHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  healthSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  scoreRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  scoreText: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  npkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  npkLabel: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  npkBadge: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  track: { height: 6, backgroundColor: '#EAEAEA', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: '#0A0A0A', borderRadius: 9999 },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 6 },
  blackBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  scanBox: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, gap: 10, backgroundColor: '#FFFFFF' },
  scanTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  pickRow: { flexDirection: 'row', gap: 10 },
  pickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F9FAFA' },
  pickText: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 13, color: '#0A0A0A', backgroundColor: '#FFFFFF' },
  resultCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF', gap: 6 },
  resultTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  resultText: { fontSize: 12, lineHeight: 18, color: '#6B7280' },
  registryCard: { width: 150, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 6, backgroundColor: '#F9FAFA' },
  regKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  regTitle: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  regSuccess: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0A0A0A' },
  regSuccessText: { fontSize: 11, color: '#6B7280' },
  bottomRow: { flexDirection: 'row', gap: 10 },
  bottomCard: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA', minHeight: 64 },
  bottomKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  bottomValue: { fontSize: 12, fontWeight: '700', color: '#0A0A0A', marginTop: 6 },
});
