// mobile/src/screens/AiToolsHubScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { getWasteHistory, getAgriHistory, getPlantHistory, getWasteStatus, relTime } from '@/services/ai';
import { router } from 'expo-router';

export default function AiToolsHubScreen() {
  const [counts, setCounts] = useState({ waste: 0, agri: 0, plant: 0 });
  const [aiOk, setAiOk] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      getWasteHistory(), getAgriHistory(), getPlantHistory(),
    ]).then(([w, a, p]) => setCounts({ waste: w.length, agri: a.length, plant: p.length }));
    getWasteStatus().then(s => setAiOk(s.ai_configured)).catch(() => setAiOk(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={28} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>AI Tools</Text>
        <Text style={styles.subtitle}>Powered by Gemini — snap, analyze, learn</Text>
      </View>

      {aiOk === false && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={18} color={colors.warning} />
          <Text style={styles.warningText}>AI not configured. Set your API key in Settings → AI Configuration.</Text>
        </View>
      )}

      {/* Tool Cards */}
      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/ai-tools/waste')}>
        <View style={[styles.toolIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
          <Ionicons name="scan" size={32} color={colors.error} />
        </View>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>Waste Analyzer</Text>
          <Text style={styles.toolDesc}>Snap an object to classify its waste type, hazard level, disposal method, and eco alternatives</Text>
          <View style={styles.toolMeta}>
            <Badge variant="info" size="sm">{counts.waste} scans</Badge>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/ai-tools/agri')}>
        <View style={[styles.toolIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
          <Ionicons name="leaf" size={32} color={colors.primary[500]} />
        </View>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>AgriSense</Text>
          <Text style={styles.toolDesc}>Photo-fertilizer advisor — scan a product to get suitability, dosage, and application steps for your crop</Text>
          <View style={styles.toolMeta}>
            <Badge variant="success" size="sm">{counts.agri} analyses</Badge>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/ai-tools/plant')}>
        <View style={[styles.toolIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
          <Ionicons name="flower" size={32} color={colors.info} />
        </View>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>PlantSense</Text>
          <Text style={styles.toolDesc}>AI plant doctor — diagnose diseases, deficiencies, and get a care plan with fertilizer recommendations</Text>
          <View style={styles.toolMeta}>
            <Badge variant="info" size="sm">{counts.plant} diagnoses</Badge>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.text.tertiary} />
      </TouchableOpacity>

      {/* Info footer */}
      <Card variant="filled" padding="md" style={styles.infoCard}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>1. Pick a tool above</Text>
        <Text style={styles.infoText}>2. Take a photo or choose from gallery</Text>
        <Text style={styles.infoText}>3. Get instant AI-powered analysis</Text>
        <Text style={styles.infoText}>4. Browse your history anytime</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background.card, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: typography.fontSize.md, color: colors.text.tertiary, marginTop: spacing.xs },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.12)', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  warningText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.warning, lineHeight: 20 },
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border.light },
  toolIcon: { width: 56, height: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  toolInfo: { flex: 1, gap: spacing.xs },
  toolTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  toolDesc: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, lineHeight: 18 },
  toolMeta: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  infoCard: { marginTop: spacing.md },
  infoTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  infoText: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.xs },
});
