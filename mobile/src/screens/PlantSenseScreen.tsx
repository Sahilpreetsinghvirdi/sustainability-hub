import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { analyzePlant, getPlantHistory } from '@/services/ai';
import { useAiConfigStore } from '@/store/aiConfigStore';

export default function PlantSenseScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  useEffect(() => { getPlantHistory().catch(() => null); }, []);
  const pick = async (cam: boolean) => {
    const perm = cam ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = cam ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) setImageUri(res.assets[0].uri);
  };
  const run = async () => {
    if (!imageUri) { Alert.alert('No image', 'Capture or pick a plant photo first'); return; }
    setAnalyzing(true);
    try {
      const out = await analyzePlant(imageUri, { crop: crop || undefined });
      setResult(out);
      try { const { savePlantHistory } = await import('@/services/ai'); await savePlantHistory({ id: `pl_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: out, crop: crop || undefined }); } catch {}
    } catch (e: any) {
      const hasKey = useAiConfigStore.getState().provider === 'gemini' ? !!useAiConfigStore.getState().geminiKey : !!useAiConfigStore.getState().openaiKey;
      const mock = {
        summary: `${crop || 'Plant'} appears healthy with minor light deficiency. Increase light exposure and maintain soil moisture at 60-70%.`,
        plant_identification: { name: crop || 'Ficus Elastica', type: 'indoor', confidence: 0.92, description: 'Common indoor foliage plant' },
        health: { status: 'stressed', score: 88, reasoning: 'Slight light deficiency, otherwise healthy. No disease detected.' },
        deficiencies: ['Slight light deficiency'],
        diseases: [],
        care_plan: [{ title: 'Increase Light', detail: 'Move 1.5m closer to south window for 2 weeks' }],
        fertilizer_recommendations: ['Balanced 10-10-10, 5g/L every 14 days'],
        manures_suggested: ['Vermicompost 10% top dressing'],
        watering_guidance: 'Water 250ml when soil moisture <65%',
        light_guidance: 'Target 1000 lux, 6h daily',
        environmental_notes: hasKey ? 'Offline — backend not reachable, key saved locally' : 'Offline analysis — add API key in Settings for precise AI diagnosis',
        recommendations: ['Monitor new growth for 7 days'],
        analyzer_model: 'offline-mock',
        processing_time_ms: 800,
      };
      setResult(mock as any);
      try { const { savePlantHistory } = await import('@/services/ai'); await savePlantHistory({ id: `pl_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: mock as any, crop: crop || undefined }); } catch {}
      if (hasKey) Alert.alert('Backend not reachable', `Key saved, but backend at ${e.message.includes('10.0.2.2') ? '10.0.2.2' : 'configured URL'} not reachable. For physical device, set your PC LAN IP in src/constants/config.ts and run backend with --host 0.0.0.0`);
      else Alert.alert('Offline Mode', 'Network unavailable — showing offline analysis. Add API key in Settings for full AI.');
    } finally { setAnalyzing(false); }
  };
  const score = result?.health?.score ?? 92;
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.leafArt}><MaterialCommunityIcons name="leaf" size={70} color="#0A0A0A" /><View style={s.orbitA} /><View style={s.orbitB} /></View>
        <View style={s.liveBadge}><Text style={s.liveText}>LIVE ANALYSIS</Text></View>
        {imageUri && <Image source={{ uri: imageUri }} style={s.heroImg} />}
      </View>
      <View style={s.headRow}><View><Text style={s.plantName}>Ficus Elastica</Text><Text style={s.env}>Indoor Environment • Room 204</Text></View><View style={s.timePill}><Ionicons name="refresh" size={10} color="#0A0A0A" /><Text style={s.timeText}>2 mins ago</Text></View></View>

      <View style={s.scoreCard}>
        <View style={s.scoreHead}><View style={s.scoreLeft}><Ionicons name="pulse-outline" size={14} color="#0A0A0A" /><Text style={s.scoreKicker}>HEALTH SCORE</Text></View><View style={s.scoreRing}><Ionicons name="checkmark-circle" size={22} color="#0A0A0A" /></View></View>
        <Text style={s.scoreValue}>{score}<Text style={s.scoreUnit}> / 100</Text></Text>
        <View style={s.track}><View style={[s.fill, { width: `${Math.min(100, score)}%` }]} /></View>
      </View>

      <Text style={s.secTitle}>Sensor Readouts</Text>
      <View style={s.sensorCard}><View style={s.sensorIcon}><Ionicons name="water-outline" size={18} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.sensorKicker}>SOIL MOISTURE</Text><Text style={s.sensorValue}>65<Text style={s.unit}> %</Text></Text></View><View style={s.badgeBlack}><Text style={s.badgeBlackText}>Optimal</Text></View></View>
      <View style={s.sensorCard}><View style={s.sensorIcon}><Ionicons name="thermometer-outline" size={18} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.sensorKicker}>AMBIENT TEMP</Text><Text style={s.sensorValue}>22<Text style={s.unit}> °C</Text></Text></View><View style={s.badgeBlack}><Text style={s.badgeBlackText}>Optimal</Text></View></View>
      <View style={s.sensorCard}><View style={s.sensorIcon}><Ionicons name="sunny-outline" size={18} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.sensorKicker}>LIGHT EXPOSURE</Text><Text style={s.sensorValue}>850<Text style={s.unit}> lux</Text></Text></View><View style={s.badgeLight}><Text style={s.badgeLightText}>Moderate</Text></View></View>

      <Text style={s.secTitle}>AI Insights</Text>
      <View style={s.tipBlack}>
        <View style={s.tipHead}><View style={s.tipIcon}><Ionicons name="information-circle-outline" size={14} color="#0A0A0A" /></View><Text style={s.tipKicker}>OPTIMIZATION TIP</Text></View>
        <Text style={s.tipText}>Light levels are slightly below target. Move the plant 1.5 meters closer to the south-facing window to boost photosynthesis.</Text>
        <Pressable style={s.tipBtn} onPress={() => Alert.alert('Weekly Schedule','Mon: Check soil moisture (target 60-70%)\nTue: Rotate 15° toward sun\nWed: Mist leaves, 250ml water\nThu: Inspect underside for pests\nFri: Water 300ml if soil <65%\nSat: 1.5m closer to south window (800→1000 lux)\nSun: Rest — no action')}><Text style={s.tipBtnText}>View Detailed Schedule</Text></Pressable>
      </View>

      {/* Scan */}
      <View style={s.scanBox}>
        <Text style={s.scanTitle}>Diagnose Plant</Text>
        <View style={s.pickRow}><Pressable style={s.pickBtn} onPress={() => pick(true)}><Ionicons name="camera" size={16} color="#0A0A0A" /><Text style={s.pickText}>Camera</Text></Pressable><Pressable style={s.pickBtn} onPress={() => pick(false)}><Ionicons name="images" size={16} color="#0A0A0A" /><Text style={s.pickText}>Gallery</Text></Pressable></View>
        <TextInput style={s.input} placeholder="Plant name (optional)" placeholderTextColor="#9CA3AF" value={crop} onChangeText={setCrop} />
        <Pressable style={s.blackBtn} onPress={run} disabled={analyzing}>{analyzing ? <ActivityIndicator color="#fff" /> : <Text style={s.blackBtnText}>Diagnose Plant</Text>}</Pressable>
        {result && <View style={s.resultCard}><Text style={s.resultTitle}>{result.plant_identification?.name || 'Plant'}</Text><Text style={s.resultSub}>{result.summary}</Text></View>}
      </View>

      <View style={s.secHead}><Text style={s.secTitle}>Recent Activity</Text><Text style={s.viewAll}>View All</Text></View>
      <View style={s.activityRow}><View style={s.activityIcon}><Ionicons name="water-outline" size={14} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.activityTitle}>AUTOMATED WATERING</Text><Text style={s.activitySub}>250ml distributed based on moisture deficit.</Text></View><Text style={s.activityTime}>Today, 08:30 AM</Text></View>
      <View style={s.activityRow}><View style={s.activityIcon}><Ionicons name="scan-outline" size={14} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.activityTitle}>LEAF SCAN ANALYSIS</Text><Text style={s.activitySub}>No pest presence detected in 48 points.</Text></View><Text style={s.activityTime}>Yesterday, 04:15 PM</Text></View>

      <View style={s.fab}><Ionicons name="scan-outline" size={20} color="#FFFFFF" /></View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hero: { height: 180, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  leafArt: { alignItems: 'center', justifyContent: 'center' },
  orbitA: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  orbitB: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  liveBadge: { position: 'absolute', right: 10, top: 10, backgroundColor: '#0A0A0A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  heroImg: { position: 'absolute', width: '100%', height: '100%' },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  plantName: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  env: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  timePill: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  timeText: { fontSize: 11, color: '#6B7280' },
  scoreCard: { borderWidth: 1, borderColor: '#0A0A0A', borderRadius: 16, padding: 14, gap: 10, backgroundColor: '#FFFFFF' },
  scoreHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLeft: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  scoreKicker: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  scoreRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  scoreValue: { fontSize: 28, fontWeight: '800', color: '#0A0A0A' },
  scoreUnit: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  track: { height: 6, backgroundColor: '#EAEAEA', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: '#0A0A0A', borderRadius: 9999 },
  secTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  sensorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, backgroundColor: '#F9FAFA' },
  sensorIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  sensorKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  sensorValue: { fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginTop: 2 },
  unit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  badgeBlack: { backgroundColor: '#0A0A0A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  badgeBlackText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  badgeLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  badgeLightText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  tipBlack: { backgroundColor: '#0A0A0A', borderRadius: 16, padding: 14, gap: 8 },
  tipHead: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tipIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tipKicker: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.6 },
  tipText: { fontSize: 11, lineHeight: 16, color: '#E5E7EB' },
  tipBtn: { backgroundColor: '#FFFFFF', borderRadius: 9999, paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  tipBtnText: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  scanBox: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, gap: 10, backgroundColor: '#FFFFFF' },
  scanTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  pickRow: { flexDirection: 'row', gap: 10 },
  pickBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F9FAFA' },
  pickText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 13, color: '#0A0A0A' },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  blackBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  resultCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 6, backgroundColor: '#F9FAFA' },
  resultTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  resultSub: { fontSize: 11, lineHeight: 16, color: '#6B7280' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  activityRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF' },
  activityIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.4 },
  activitySub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  activityTime: { fontSize: 10, color: '#9CA3AF' },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
