// mobile/src/screens/AgriSenseScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  TextInput, Image, FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, ProgressBar } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import {
  analyzeFertilizer, getWasteStatus, getAgriHistory, saveAgriHistory, clearAgriHistory,
  AgriAnalysisResponse, AgriHistoryItem, relTime,
} from '@/services/ai';
import { router } from 'expo-router';

type Tab = 'analyzer' | 'history';

export default function AgriSenseScreen() {
  const [tab, setTab] = useState<Tab>('analyzer');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [soilType, setSoilType] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AgriAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AgriHistoryItem[]>([]);
  const [statusOk, setStatusOk] = useState<boolean | null>(null);

  useEffect(() => {
    getWasteStatus().then(s => setStatusOk(s.ai_configured)).catch(() => setStatusOk(false));
    getAgriHistory().then(setHistory);
  }, []);

  const pickImage = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${useCamera ? 'camera' : 'photo library'} access.`);
      return;
    }
    const res = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const runAnalysis = async () => {
    if (!imageUri) { Alert.alert('No image', 'Capture or pick an image first.'); return; }
    if (!crop.trim()) { Alert.alert('Crop required', 'Enter the crop/plant name.'); return; }
    setAnalyzing(true);
    try {
      const out = await analyzeFertilizer(imageUri, {
        crop: crop.trim(),
        growth_stage: growthStage.trim() || undefined,
        soil_type: soilType.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(out);
      const item: AgriHistoryItem = {
        id: `ag_${Date.now()}`,
        timestamp: new Date().toISOString(),
        previewUrl: imageUri,
        outcome: out,
        crop: crop.trim(),
      };
      await saveAgriHistory(item);
      setHistory(prev => [item, ...prev.filter(e => e.id !== item.id)]);
    } catch (e: any) {
      Alert.alert('Analysis failed', e?.message || 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const openHistoryItem = (item: AgriHistoryItem) => {
    setImageUri(item.previewUrl);
    setCrop(item.crop);
    setResult(item.outcome);
    setTab('analyzer');
  };

  const handleClearHistory = () => {
    Alert.alert('Clear history', 'Delete all AgriSense history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearAgriHistory(); setHistory([]); } },
    ]);
  };

  const suitabilityColor = (score: number) => score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;
  const effectiveSuitability = (result: AgriAnalysisResponse): { score: number; label: string; color: string } => {
    const s = result.verdict.suitability;
    const score = result.verdict.score;
    if (s === 'harmful' || score <= 15) return { score: 0, label: 'DO NOT APPLY', color: colors.error };
    return { score, label: s.replace(/_/g, ' '), color: suitabilityColor(score) };
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'analyzer' && styles.tabActive]} onPress={() => setTab('analyzer')}>
          <Ionicons name="leaf" size={18} color={tab === 'analyzer' ? colors.primary[500] : colors.text.tertiary} />
          <Text style={[styles.tabText, tab === 'analyzer' && styles.tabTextActive]}>Analyzer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Ionicons name="time-outline" size={18} color={tab === 'history' ? colors.primary[500] : colors.text.tertiary} />
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History ({history.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'analyzer' ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {statusOk === false && (
            <Card variant="filled" padding="md" style={styles.statusCard}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.statusText}>AI not configured. Set API key in Settings.</Text>
            </Card>
          )}

          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
              <Ionicons name="camera" size={28} color={colors.primary[500]} />
              <Text style={styles.pickLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
              <Ionicons name="images" size={28} color={colors.secondary[500]} />
              <Text style={styles.pickLabel}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <Card variant="elevated" padding="none" style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            </Card>
          )}

          <TextInput style={styles.input} placeholder="Crop / Plant name *" placeholderTextColor={colors.text.tertiary} value={crop} onChangeText={setCrop} />
          <TextInput style={styles.input} placeholder="Growth stage (e.g. seedling, vegetative)" placeholderTextColor={colors.text.tertiary} value={growthStage} onChangeText={setGrowthStage} />
          <TextInput style={styles.input} placeholder="Soil type (optional)" placeholderTextColor={colors.text.tertiary} value={soilType} onChangeText={setSoilType} />
          <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Notes (optional)" placeholderTextColor={colors.text.tertiary} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />

          <TouchableOpacity
            style={[styles.analyzeBtn, (!imageUri || !crop.trim() || analyzing) && styles.btnDisabled]}
            onPress={runAnalysis}
            disabled={!imageUri || !crop.trim() || analyzing}
          >
            {analyzing ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>Analyze Fertilizer</Text>
              </>
            )}
          </TouchableOpacity>

          {result && (
            <View style={styles.resultSection}>
              {/* Harmful warning banner */}
              {result.verdict.suitability === 'harmful' && (
                <View style={styles.harmfulBanner}>
                  <Ionicons name="warning" size={24} color="#fff" />
                  <Text style={styles.harmfulText}>DO NOT APPLY — Harmful to this crop</Text>
                </View>
              )}

              <Card variant="elevated" padding="lg">
                <Text style={styles.resultSummary}>{result.summary}</Text>
                <View style={styles.suitRow}>
                  <Text style={styles.suitLabel}>Suitability</Text>
                  <Text style={[styles.suitValue, { color: effectiveSuitability(result).color }]}>
                    {effectiveSuitability(result).label} ({result.verdict.score}/100)
                  </Text>
                </View>
                <ProgressBar
                  progress={effectiveSuitability(result).score}
                  variant={result.verdict.score >= 70 ? 'success' : result.verdict.score >= 40 ? 'warning' : 'danger'}
                  size="sm"
                  style={{ marginTop: spacing.sm }}
                />
                <Text style={styles.reasoning}>{result.verdict.reasoning}</Text>
              </Card>

              <Card variant="default" padding="md">
                <Text style={styles.sectionTitle}>Product: {result.product_identification.name}</Text>
                <Text style={styles.sectionSub}>{result.product_identification.type} — {result.product_identification.description}</Text>
                <Text style={styles.npkText}>NPK: {result.nutrient_profile.npk}</Text>
              </Card>

              {result.benefits.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>✅ Benefits</Text>
                  {result.benefits.map((b, i) => <Text key={i} style={styles.listItem}>• {b}</Text>)}
                </Card>
              )}

              {result.risks_cautions.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>⚠️ Risks & Cautions</Text>
                  {result.risks_cautions.map((r, i) => <Text key={i} style={styles.listItem}>• {r}</Text>)}
                </Card>
              )}

              {result.application_guidance.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>📋 Application Steps</Text>
                  {result.application_guidance.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={styles.stepNum}>{i + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepDetail}>{step.detail}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              )}

              <Card variant="filled" padding="md">
                <Text style={styles.sectionTitle}>📊 Details</Text>
                <Text style={styles.detailLine}>Dosage: {result.dosage}</Text>
                <Text style={styles.detailLine}>Best timing: {result.best_timing}</Text>
                <Text style={styles.detailLine}>pH effect: {result.nutrient_profile.ph_effect}</Text>
                <Text style={styles.detailLine}>Environmental: {result.environmental_notes}</Text>
              </Card>

              <Card variant="default" padding="md">
                <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                {result.recommendations.map((r, i) => <Text key={i} style={styles.listItem}>• {r}</Text>)}
              </Card>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          {history.length > 0 && (
            <View style={styles.historyHeader}>
              <Text style={styles.historyCount}>{history.length} analyses</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearBtn}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={56} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No analyses yet</Text>
              <Text style={styles.emptySubtext}>Snap a fertilizer to get started</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.historyList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.historyItem} onPress={() => openHistoryItem(item)}>
                  <Image source={{ uri: item.thumb || item.previewUrl }} style={styles.historyThumb} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historySummary} numberOfLines={1}>{item.crop} — {item.outcome.product_identification.name}</Text>
                    <View style={styles.historyMeta}>
                      <Badge variant={item.outcome.verdict.score >= 70 ? 'success' : item.outcome.verdict.score >= 40 ? 'warning' : 'danger'} size="sm">
                        {item.outcome.verdict.suitability.replace(/_/g, ' ')}
                      </Badge>
                      <Text style={styles.historyTime}>{relTime(item.timestamp)}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border.light },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary[500] },
  tabText: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, fontWeight: typography.fontWeight.medium },
  tabTextActive: { color: colors.primary[500] },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.warning },
  pickRow: { flexDirection: 'row', gap: spacing.md },
  pickBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, backgroundColor: colors.background.card, borderRadius: borderRadius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border.medium },
  pickLabel: { marginTop: spacing.xs, fontSize: typography.fontSize.sm, color: colors.text.secondary, fontWeight: typography.fontWeight.medium },
  imageCard: { overflow: 'hidden', borderRadius: borderRadius.lg },
  imagePreview: { width: '100%', height: 200, borderRadius: borderRadius.lg },
  input: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light, borderRadius: borderRadius.md, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text.primary },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary[500], paddingVertical: spacing.md, borderRadius: borderRadius.md },
  btnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  resultSection: { gap: spacing.md },
  harmfulBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.error, padding: spacing.md, borderRadius: borderRadius.md },
  harmfulText: { color: '#fff', fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, flex: 1 },
  resultSummary: { fontSize: typography.fontSize.md, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.sm },
  suitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suitLabel: { fontSize: typography.fontSize.sm, color: colors.text.tertiary },
  suitValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  reasoning: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  sectionSub: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  npkText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium, color: colors.primary[500], marginTop: spacing.sm },
  listItem: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
  stepRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stepNum: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary[500] },
  stepTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  stepDetail: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 18 },
  detailLine: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
  historyContainer: { flex: 1 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  historyCount: { fontSize: typography.fontSize.sm, color: colors.text.tertiary },
  clearBtn: { fontSize: typography.fontSize.sm, color: colors.error, fontWeight: typography.fontWeight.medium },
  historyList: { padding: spacing.md, gap: spacing.sm },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.md, padding: spacing.sm, gap: spacing.sm },
  historyThumb: { width: 56, height: 56, borderRadius: borderRadius.sm },
  historyInfo: { flex: 1, gap: spacing.xs },
  historySummary: { fontSize: typography.fontSize.sm, color: colors.text.primary, lineHeight: 18 },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  historyTime: { fontSize: typography.fontSize.xs, color: colors.text.tertiary },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: 32 },
  emptyText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  emptySubtext: { fontSize: typography.fontSize.md, color: colors.text.tertiary },
});
