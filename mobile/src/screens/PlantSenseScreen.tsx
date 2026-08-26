// mobile/src/screens/PlantSenseScreen.tsx
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
  analyzePlant, getWasteStatus, getPlantHistory, savePlantHistory, clearPlantHistory,
  PlantAnalysisResponse, PlantHistoryItem, relTime,
} from '@/services/ai';
import { router } from 'expo-router';

type Tab = 'analyzer' | 'history';

export default function PlantSenseScreen() {
  const [tab, setTab] = useState<Tab>('analyzer');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantAnalysisResponse | null>(null);
  const [history, setHistory] = useState<PlantHistoryItem[]>([]);
  const [statusOk, setStatusOk] = useState<boolean | null>(null);

  useEffect(() => {
    getWasteStatus().then(s => setStatusOk(s.ai_configured)).catch(() => setStatusOk(false));
    getPlantHistory().then(setHistory);
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
    if (!imageUri) { Alert.alert('No image', 'Capture or pick a plant image first.'); return; }
    setAnalyzing(true);
    try {
      const out = await analyzePlant(imageUri, {
        crop: crop.trim() || undefined,
        growth_stage: growthStage.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(out);
      const item: PlantHistoryItem = {
        id: `pl_${Date.now()}`,
        timestamp: new Date().toISOString(),
        previewUrl: imageUri,
        outcome: out,
        crop: crop.trim() || undefined,
      };
      await savePlantHistory(item);
      setHistory(prev => [item, ...prev.filter(e => e.id !== item.id)]);
    } catch (e: any) {
      Alert.alert('Analysis failed', e?.message || 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const openHistoryItem = (item: PlantHistoryItem) => {
    setImageUri(item.previewUrl);
    setCrop(item.crop || '');
    setResult(item.outcome);
    setTab('analyzer');
  };

  const handleClearHistory = () => {
    Alert.alert('Clear history', 'Delete all PlantSense history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearPlantHistory(); setHistory([]); } },
    ]);
  };

  const healthColor = (status: string) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'stressed': return colors.warning;
      case 'diseased': return colors.error;
      case 'critical': return colors.error;
      default: return colors.text.tertiary;
    }
  };

  const healthBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'healthy': return 'success';
      case 'stressed': return 'warning';
      case 'diseased': return 'danger';
      case 'critical': return 'danger';
      default: return 'info';
    }
  };

  const goToAgriSense = (product: string) => {
    Alert.alert(
      'Open AgriSense?',
      `Check fertilizer "${product}" in AgriSense?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => router.push('/ai-tools/agri') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'analyzer' && styles.tabActive]} onPress={() => setTab('analyzer')}>
          <Ionicons name="flower" size={18} color={tab === 'analyzer' ? colors.primary[500] : colors.text.tertiary} />
          <Text style={[styles.tabText, tab === 'analyzer' && styles.tabTextActive]}>Diagnose</Text>
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

          <TextInput style={styles.input} placeholder="Plant name (optional)" placeholderTextColor={colors.text.tertiary} value={crop} onChangeText={setCrop} />
          <TextInput style={styles.input} placeholder="Growth stage (optional)" placeholderTextColor={colors.text.tertiary} value={growthStage} onChangeText={setGrowthStage} />
          <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Notes (optional)" placeholderTextColor={colors.text.tertiary} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />

          <TouchableOpacity
            style={[styles.analyzeBtn, (!imageUri || analyzing) && styles.btnDisabled]}
            onPress={runAnalysis}
            disabled={!imageUri || analyzing}
          >
            {analyzing ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>Diagnose Plant</Text>
              </>
            )}
          </TouchableOpacity>

          {result && (
            <View style={styles.resultSection}>
              {/* Critical alert */}
              {result.health.status === 'critical' && (
                <View style={styles.criticalBanner}>
                  <Ionicons name="alert-circle" size={24} color="#fff" />
                  <Text style={styles.criticalText}>CRITICAL — Immediate attention required</Text>
                </View>
              )}

              {/* Health Score */}
              <Card variant="elevated" padding="lg">
                <View style={styles.healthHeader}>
                  <View style={[styles.healthDot, { backgroundColor: healthColor(result.health.status) }]} />
                  <Text style={styles.healthStatus}>{result.health.status.toUpperCase()}</Text>
                  <Badge variant={healthBadgeVariant(result.health.status)} size="md">
                    {result.health.score}/100
                  </Badge>
                </View>
                <ProgressBar
                  progress={result.health.score}
                  variant={result.health.score >= 70 ? 'success' : result.health.score >= 40 ? 'warning' : 'danger'}
                  size="md"
                  style={{ marginTop: spacing.sm }}
                />
                <Text style={styles.reasoning}>{result.health.reasoning}</Text>
                <Text style={styles.resultSummary}>{result.summary}</Text>
                {result.plant_identification.confidence > 0 && (
                  <Text style={styles.identText}>
                    Identified: {result.plant_identification.name} ({Math.round(result.plant_identification.confidence * 100)}%)
                  </Text>
                )}
              </Card>

              {/* Diseases */}
              {result.diseases.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>🦠 Diseases Detected</Text>
                  {result.diseases.map((d, i) => (
                    <View key={i} style={styles.diseaseCard}>
                      <View style={styles.diseaseHeader}>
                        <Text style={styles.diseaseName}>{d.name}</Text>
                        <Badge variant="danger" size="sm">{d.pathogen_type}</Badge>
                      </View>
                      <Text style={styles.diseaseSev}>Severity: {d.severity}</Text>
                      {d.symptoms.length > 0 && (
                        <View style={styles.symptomList}>
                          {d.symptoms.map((s, j) => <Text key={j} style={styles.symptomItem}>• {s}</Text>)}
                        </View>
                      )}
                      <Text style={styles.treatment}>💊 Treatment: {d.treatment}</Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* Deficiencies */}
              {result.deficiencies.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>⚠️ Deficiencies</Text>
                  {result.deficiencies.map((d, i) => <Text key={i} style={styles.listItem}>• {d}</Text>)}
                </Card>
              )}

              {/* Care Plan */}
              {result.care_plan.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>📋 Care Plan</Text>
                  {result.care_plan.map((step, i) => (
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

              {/* Watering & Light */}
              <Card variant="filled" padding="md">
                <Text style={styles.sectionTitle}>💧 Environmental</Text>
                <Text style={styles.detailLine}>Watering: {result.watering_guidance}</Text>
                <Text style={styles.detailLine}>Light: {result.light_guidance}</Text>
                {result.environmental_notes && <Text style={styles.detailLine}>Notes: {result.environmental_notes}</Text>}
              </Card>

              {/* Fertilizer */}
              {result.fertilizer_recommendations.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>🧪 Fertilizer Recommendations</Text>
                  {result.fertilizer_recommendations.map((f, i) => (
                    <TouchableOpacity key={i} style={styles.fertItem} onPress={() => goToAgriSense(f)}>
                      <Text style={styles.fertText}>• {f}</Text>
                      <Ionicons name="open-outline" size={14} color={colors.primary[500]} />
                    </TouchableOpacity>
                  ))}
                </Card>
              )}

              {/* Manures */}
              {result.manures_suggested.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>🌿 Suggested Manures</Text>
                  {result.manures_suggested.map((m, i) => (
                    <TouchableOpacity key={i} style={styles.fertItem} onPress={() => goToAgriSense(m)}>
                      <Text style={styles.fertText}>• {m}</Text>
                      <Ionicons name="open-outline" size={14} color={colors.primary[500]} />
                    </TouchableOpacity>
                  ))}
                </Card>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card variant="default" padding="md">
                  <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                  {result.recommendations.map((r, i) => <Text key={i} style={styles.listItem}>• {r}</Text>)}
                </Card>
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          {history.length > 0 && (
            <View style={styles.historyHeader}>
              <Text style={styles.historyCount}>{history.length} diagnoses</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearBtn}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flower-outline" size={56} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No diagnoses yet</Text>
              <Text style={styles.emptySubtext}>Snap a plant to diagnose its health</Text>
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
                    <Text style={styles.historySummary} numberOfLines={1}>
                      {item.outcome.plant_identification.name || item.crop || 'Unknown plant'}
                    </Text>
                    <View style={styles.historyMeta}>
                      <Badge variant={healthBadgeVariant(item.outcome.health.status)} size="sm">
                        {item.outcome.health.status}
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
  criticalBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.error, padding: spacing.md, borderRadius: borderRadius.md },
  criticalText: { color: '#fff', fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, flex: 1 },
  healthHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  healthDot: { width: 12, height: 12, borderRadius: 6 },
  healthStatus: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary, flex: 1 },
  reasoning: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginTop: spacing.sm },
  resultSummary: { fontSize: typography.fontSize.md, color: colors.text.primary, lineHeight: 22, marginTop: spacing.sm },
  identText: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginTop: spacing.xs },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  listItem: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
  diseaseCard: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.sm },
  diseaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, flex: 1 },
  diseaseSev: { fontSize: typography.fontSize.sm, color: colors.warning, marginTop: spacing.xs },
  symptomList: { marginTop: spacing.xs },
  symptomItem: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 18 },
  treatment: { fontSize: typography.fontSize.sm, color: colors.primary[500], marginTop: spacing.sm, fontWeight: typography.fontWeight.medium },
  stepRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stepNum: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary[500] },
  stepTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  stepDetail: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 18 },
  detailLine: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
  fertItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  fertText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: 100 },
  emptyText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  emptySubtext: { fontSize: typography.fontSize.md, color: colors.text.tertiary },
});
