// mobile/src/screens/WasteAnalyzerScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  TextInput, Image, FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, ProgressBar } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import {
  analyzeWaste, getWasteStatus, getWasteHistory, saveWasteHistory, clearWasteHistory,
  WasteAnalysisResponse, WasteHistoryItem, relTime,
} from '@/services/ai';
import { router } from 'expo-router';

type Tab = 'analyzer' | 'history';

export default function WasteAnalyzerScreen() {
  const [tab, setTab] = useState<Tab>('analyzer');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResponse | null>(null);
  const [history, setHistory] = useState<WasteHistoryItem[]>([]);
  const [statusOk, setStatusOk] = useState<boolean | null>(null);

  useEffect(() => {
    getWasteStatus().then(s => setStatusOk(s.ai_configured)).catch(() => setStatusOk(false));
    getWasteHistory().then(setHistory);
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
    setAnalyzing(true);
    try {
      const out = await analyzeWaste(imageUri, question);
      setResult(out);
      const item: WasteHistoryItem = {
        id: `w_${Date.now()}`,
        timestamp: new Date().toISOString(),
        previewUrl: imageUri,
        outcome: out,
        question: question || undefined,
      };
      await saveWasteHistory(item);
      setHistory(prev => [item, ...prev.filter(e => e.id !== item.id)]);
    } catch (e: any) {
      Alert.alert('Analysis failed', e?.message || 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const openHistoryItem = (item: WasteHistoryItem) => {
    setImageUri(item.previewUrl);
    setResult(item.outcome);
    setTab('analyzer');
  };

  const handleClearHistory = () => {
    Alert.alert('Clear history', 'Delete all waste analysis history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearWasteHistory(); setHistory([]); } },
    ]);
  };

  const hazardColor = (score: number) => score >= 70 ? colors.error : score >= 40 ? colors.warning : colors.success;
  const hazardLabel = (level: string) => level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'analyzer' && styles.tabActive]} onPress={() => setTab('analyzer')}>
          <Ionicons name="scan" size={18} color={tab === 'analyzer' ? colors.primary[500] : colors.text.tertiary} />
          <Text style={[styles.tabText, tab === 'analyzer' && styles.tabTextActive]}>Analyzer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Ionicons name="time-outline" size={18} color={tab === 'history' ? colors.primary[500] : colors.text.tertiary} />
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History ({history.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'analyzer' ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Status */}
          {statusOk === false && (
            <Card variant="filled" padding="md" style={styles.statusCard}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.statusText}>AI not configured. Set API key in Settings.</Text>
            </Card>
          )}

          {/* Image Picker */}
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

          {/* Image Preview */}
          {imageUri && (
            <Card variant="elevated" padding="none" style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            </Card>
          )}

          {/* Question Input */}
          <TextInput
            style={styles.input}
            placeholder="Optional: what do you want to know? (e.g. can I compost this?)"
            placeholderTextColor={colors.text.tertiary}
            value={question}
            onChangeText={setQuestion}
            multiline
          />

          {/* Analyze Button */}
          <TouchableOpacity
            style={[styles.analyzeBtn, (!imageUri || analyzing) && styles.analyzeBtnDisabled]}
            onPress={runAnalysis}
            disabled={!imageUri || analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>Analyze Waste</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Results */}
          {result && (
            <View style={styles.resultSection}>
              <Card variant="elevated" padding="lg">
                <Text style={styles.resultSummary}>{result.summary}</Text>
                <View style={styles.hazardRow}>
                  <View style={[styles.hazardDot, { backgroundColor: hazardColor(result.overall_hazard.score) }]} />
                  <Text style={styles.hazardLabel}>
                    Overall Hazard: {hazardLabel(result.overall_hazard.level)} ({result.overall_hazard.score}/100)
                  </Text>
                </View>
                <ProgressBar
                  progress={result.overall_hazard.score}
                  variant={result.overall_hazard.score >= 70 ? 'danger' : result.overall_hazard.score >= 40 ? 'warning' : 'success'}
                  size="sm"
                  style={{ marginTop: spacing.sm }}
                />
                {result.overall_hazard.toxins.length > 0 && (
                  <View style={styles.tagRow}>
                    {result.overall_hazard.toxins.map((t, i) => (
                      <Badge key={i} variant="danger" size="sm">{t}</Badge>
                    ))}
                  </View>
                )}
              </Card>

              {result.materials.map((mat, i) => (
                <Card key={i} variant="default" padding="md" style={styles.materialCard}>
                  <View style={styles.matHeader}>
                    <Text style={styles.matName}>{mat.name}</Text>
                    <Badge variant={mat.hazard.level === 'critical' ? 'danger' : mat.hazard.level === 'high' ? 'danger' : mat.hazard.level === 'medium' ? 'warning' : 'success'} size="sm">
                      {mat.percentage}% · {mat.category}
                    </Badge>
                  </View>
                  <Text style={styles.matDesc}>{mat.description}</Text>
                  {mat.reuse_ideas.length > 0 && (
                    <View style={styles.ideaSection}>
                      <Text style={styles.ideaTitle}>♻️ Reuse Ideas</Text>
                      {mat.reuse_ideas.map((idea, j) => (
                        <Text key={j} style={styles.ideaItem}>• {idea}</Text>
                      ))}
                    </View>
                  )}
                  <View style={styles.disposalRow}>
                    <Ionicons name={mat.disposal.recyclable ? 'checkmark-circle' : 'close-circle'} size={16} color={mat.disposal.recyclable ? colors.success : colors.error} />
                    <Text style={styles.disposalText}>{mat.disposal.method} → {mat.disposal.destination}</Text>
                  </View>
                </Card>
              ))}

              <Card variant="default" padding="md">
                <Text style={styles.recTitle}>Recommendations</Text>
                {result.recommendations.map((r, i) => (
                  <Text key={i} style={styles.recItem}>• {r}</Text>
                ))}
              </Card>

              {result.environmental_impact && (
                <Card variant="filled" padding="md">
                  <Text style={styles.envTitle}>🌍 Environmental Impact</Text>
                  <Text style={styles.envText}>{result.environmental_impact}</Text>
                </Card>
              )}
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
              <Ionicons name="scan-outline" size={56} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No analyses yet</Text>
              <Text style={styles.emptySubtext}>Scan an item to get started</Text>
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
                    <Text style={styles.historySummary} numberOfLines={2}>{item.outcome.summary}</Text>
                    <View style={styles.historyMeta}>
                      <Badge variant={item.outcome.overall_hazard.score >= 70 ? 'danger' : item.outcome.overall_hazard.score >= 40 ? 'warning' : 'success'} size="sm">
                        {item.outcome.overall_hazard.level}
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
  input: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light, borderRadius: borderRadius.md, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text.primary, minHeight: 60, textAlignVertical: 'top' },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary[500], paddingVertical: spacing.md, borderRadius: borderRadius.md },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  resultSection: { gap: spacing.md },
  resultSummary: { fontSize: typography.fontSize.md, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.sm },
  hazardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hazardDot: { width: 10, height: 10, borderRadius: 5 },
  hazardLabel: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontWeight: typography.fontWeight.medium },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  materialCard: { gap: spacing.sm },
  matHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, flex: 1 },
  matDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  ideaSection: { marginTop: spacing.xs },
  ideaTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  ideaItem: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  disposalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  disposalText: { fontSize: typography.fontSize.sm, color: colors.text.tertiary },
  recTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  recItem: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
  envTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  envText: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
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
