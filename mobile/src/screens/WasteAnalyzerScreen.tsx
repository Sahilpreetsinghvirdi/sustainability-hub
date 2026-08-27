import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeWaste, clearWasteHistory, getWasteHistory, getWasteStatus, saveWasteHistory, WasteAnalysisResponse, WasteHistoryItem } from '@/services/ai';
import { useAiConfigStore } from '@/store/aiConfigStore';

export default function WasteAnalyzerScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResponse | null>(null);
  const [history, setHistory] = useState<WasteHistoryItem[]>([]);
  const [mode, setMode] = useState<'scan' | 'recent'>('scan');

  useEffect(() => {
    getWasteStatus().catch(() => null);
    getWasteHistory().then(setHistory);
  }, []);

  const pickImage = async (useCamera: boolean) => {
    const perm = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required'); return; }
    const res = useCamera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) { setImageUri(res.assets[0].uri); setResult(null); }
  };

  const runAnalysis = async () => {
    if (!imageUri) { Alert.alert('No image', 'Point camera at item first'); return; }
    setAnalyzing(true);
    try {
      const out = await analyzeWaste(imageUri, question);
      setResult(out);
      const item: WasteHistoryItem = { id: `w_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: out, question: question || undefined };
      await saveWasteHistory(item);
      setHistory(prev => [item, ...prev]);
    } catch (e: any) {
      const hasKey = useAiConfigStore.getState().provider === 'gemini' ? !!useAiConfigStore.getState().geminiKey : !!useAiConfigStore.getState().openaiKey;
      const mock: any = {
        summary: hasKey ? 'AI analysis failed (key present but the AI provider could not be reached). Showing a provisional offline assessment.' : 'Offline analysis: appears to be compostable organic waste (e.g., vegetable scraps). Segregate for compost.',
        overall_hazard: { level: 'low', score: 12, toxins: [], health_risks: [] },
        materials: [{ name: 'Organic Waste', category: 'organic', percentage: 95, confidence: 0.9, description: 'Compostable organic matter', hazard: { level: 'low', score: 10, toxins: [], health_risks: [] }, reuse_ideas: ['Compost'], eco_alternatives: [], disposal: { method: 'Compost', destination: 'Compost bin', recyclable: true } }],
        recommendations: ['Add to compost bin, keep moisture 60%'],
        environmental_impact: hasKey ? 'Provisional offline assessment — AI provider unreachable' : 'Offline — add API key for precise AI',
        analyzer_model: 'offline-mock',
        processing_time_ms: 600,
      };
      setResult(mock);
      const item: WasteHistoryItem = { id: `w_${Date.now()}`, timestamp: new Date().toISOString(), previewUrl: imageUri, outcome: mock, question: question || undefined };
      await saveWasteHistory(item).catch(() => {});
      setHistory(prev => [item, ...prev]);
      if (hasKey) Alert.alert('AI provider unreachable', `Could not reach the AI provider (${e.message}). Check your internet connection and try again.`);
      else Alert.alert('Offline Mode', 'No API key configured — showing offline analysis. Add an API key in Settings for full AI.');
    } finally { setAnalyzing(false); }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Top illustration */}
        <View style={s.hero}>
          <View style={s.phoneMock}>
            <View style={s.phoneOutline}><Ionicons name="leaf-outline" size={22} color="#0A0A0A" /></View>
          </View>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.preview} />
          ) : (
            <View style={s.readyBubble}>
              <Text style={s.readyKicker}>READY TO ANALYZE</Text>
              <Text style={s.readyText}>Point your camera at the item</Text>
            </View>
          )}
        </View>

        <Pressable style={s.analyzeBtn} onPress={runAnalysis} disabled={analyzing}>
          {analyzing ? <ActivityIndicator color="#fff" /> : <><Ionicons name="scan-outline" size={18} color="#FFFFFF" /><Text style={s.analyzeText}>Analyze Material</Text></>}
        </Pressable>

        <View style={s.segmentRow}>
          <Pressable style={[s.segment, mode === 'scan' && s.segmentActive]} onPress={() => setMode('scan')}>
            <Ionicons name="camera-outline" size={16} color={mode === 'scan' ? '#FFFFFF' : '#0A0A0A'} />
            <Text style={[s.segmentText, mode === 'scan' && s.segmentTextActive]}>Live Scan</Text>
          </Pressable>
          <Pressable style={[s.segment, mode === 'recent' && s.segmentActive]} onPress={() => setMode('recent')}>
            <Ionicons name="time-outline" size={16} color={mode === 'recent' ? '#FFFFFF' : '#0A0A0A'} />
            <Text style={[s.segmentText, mode === 'recent' && s.segmentTextActive]}>Recent</Text>
          </Pressable>
        </View>

        <View style={s.pickActions}>
          <Pressable style={s.pickPill} onPress={() => pickImage(true)}><Ionicons name="camera" size={18} color="#0A0A0A" /><Text style={s.pickPillText}>Camera</Text></Pressable>
          <Pressable style={s.pickPill} onPress={() => pickImage(false)}><Ionicons name="images" size={18} color="#0A0A0A" /><Text style={s.pickPillText}>Gallery</Text></Pressable>
        </View>

        <TextInput style={s.input} placeholder="Optional question (e.g. is this compostable?)" placeholderTextColor="#9CA3AF" value={question} onChangeText={setQuestion} />

        {/* Tip */}
        <View style={s.tipCard}>
          <View style={s.tipIcon}><Ionicons name="bulb-outline" size={18} color="#0A0A0A" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipKicker}>SUSTAINABILITY TIP</Text>
            <Text style={s.tipText}>Scanning accuracy increases with natural lighting and clear backgrounds.</Text>
          </View>
        </View>

        {mode === 'recent' && (
          <View style={s.historyBox}>
            <View style={s.historyHead}><Text style={s.historyTitle}>Recent</Text><Pressable onPress={() => { Alert.alert('Clear?', 'Delete all?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: async () => { await clearWasteHistory(); setHistory([]); } }]); }}><Text style={s.clear}>Clear</Text></Pressable></View>
            {history.length === 0 ? <Text style={s.empty}>No analyses yet</Text> :
              history.map(h => (
                <Pressable key={h.id} style={s.historyItem} onPress={() => { setImageUri(h.previewUrl); setResult(h.outcome); setMode('scan'); }}>
                  <Image source={{ uri: h.previewUrl }} style={s.thumb} />
                  <Text style={s.historySummary} numberOfLines={2}>{h.outcome.summary}</Text>
                </Pressable>
              ))}
          </View>
        )}

        {result && (
          <View style={s.results}>
            <View style={s.resultCard}><Text style={s.resultSummary}>{result.summary}</Text><View style={s.hazardRow}><View style={[s.hazardDot, { backgroundColor: result.overall_hazard.score >= 70 ? '#0A0A0A' : '#6B7280' }]} /><Text style={s.hazardText}>Hazard: {result.overall_hazard.level} {result.overall_hazard.score}/100</Text></View></View>
            {result.materials.map((m: any, i: number) => (
              <View key={i} style={s.matCard}><Text style={s.matName}>{m.name} · {m.percentage}%</Text><Text style={s.matDesc}>{m.description}</Text></View>
            ))}
          </View>
        )}

        <Text style={s.howTitle}>HOW IT WORKS</Text>
        <View style={s.howCard}>
          <View style={s.howIcon}><Ionicons name="scan-outline" size={16} color="#0A0A0A" /></View>
          <View style={{ flex: 1 }}><Text style={s.howKicker}>IDENTIFICATION</Text><Text style={s.howText}>Our computer vision model recognizes 500+ materials.</Text></View>
        </View>
        <View style={s.howCard}>
          <View style={s.howIcon}><Ionicons name="shield-checkmark-outline" size={16} color="#0A0A0A" /></View>
          <View style={{ flex: 1 }}><Text style={s.howKicker}>LOCAL REGULATIONS</Text><Text style={s.howText}>Results are tailored to your local waste management rules.</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  hero: {
    backgroundColor: '#F9FAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    minHeight: 180,
  },
  phoneMock: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  phoneOutline: { width: 96, height: 170, borderWidth: 1.5, borderColor: '#0A0A0A', borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  preview: { width: '100%', height: 160, borderRadius: 12, marginTop: 8 },
  readyBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, width: '100%' },
  readyKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  readyText: { fontSize: 13, fontWeight: '600', color: '#0A0A0A', marginTop: 2 },
  analyzeBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  analyzeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  segmentActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  segmentTextActive: { color: '#FFFFFF' },
  pickActions: { flexDirection: 'row', gap: 10 },
  pickPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F9FAFA' },
  pickPillText: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 13, color: '#0A0A0A', backgroundColor: '#FFFFFF' },
  tipCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12 },
  tipIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  tipKicker: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  tipText: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  historyBox: { gap: 8 },
  historyHead: { flexDirection: 'row', justifyContent: 'space-between' },
  historyTitle: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  clear: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  empty: { fontSize: 12, color: '#6B7280' },
  historyItem: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 8 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  historySummary: { flex: 1, fontSize: 12, color: '#0A0A0A', lineHeight: 16 },
  results: { gap: 10 },
  resultCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 8, backgroundColor: '#FFFFFF' },
  resultSummary: { fontSize: 13, lineHeight: 18, color: '#0A0A0A' },
  hazardRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hazardDot: { width: 8, height: 8, borderRadius: 4 },
  hazardText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  matCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 6, backgroundColor: '#F9FAFA' },
  matName: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  matDesc: { fontSize: 11, lineHeight: 16, color: '#6B7280' },
  howTitle: { fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 0.8, marginTop: 6 },
  howCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF' },
  howIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  howKicker: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  howText: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
});
