import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAgriHistory, getPlantHistory, getWasteHistory, getWasteStatus } from '@/services/ai';

export default function AiToolsHubScreen() {
  const [counts, setCounts] = useState({ waste: 0, agri: 0, plant: 0 });
  useEffect(() => {
    Promise.all([getWasteHistory(), getAgriHistory(), getPlantHistory()]).then(([w, a, p]) => setCounts({ waste: w.length, agri: a.length, plant: p.length }));
    getWasteStatus().catch(() => null);
  }, []);
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.kickerRow}>
          <Ionicons name="sparkles-outline" size={14} color="#0A0A0A" />
          <Text style={s.kicker}>INTELLIGENCE SUITE</Text>
        </View>
        <Text style={s.title}>Eco-AI Systems</Text>
        <Text style={s.sub}>Leverage advanced neural networks to analyze waste, monitor crops, and optimize plant health in real-time.</Text>
      </View>

      {/* Hero illustration */}
      <View style={s.heroIllu}>
        <View style={s.heroBadge}><View style={s.dot} /><Text style={s.heroBadgeText}>Active</Text></View>
        <View style={s.phoneMock}>
          <View style={s.phoneOutline}>
            <View style={s.phoneLeaf}><Ionicons name="leaf-outline" size={20} color="#0A0A0A" /></View>
          </View>
        </View>
        <View style={s.produceRow}>
          <Ionicons name="leaf" size={10} color="#9CA3AF" />
          <Text style={s.produceText}>Banana • Apple • Greens</Text>
        </View>
        <View style={s.tagVision}><Text style={s.tagText}>Vision AI</Text></View>
      </View>

      {/* Waste Analyzer */}
      <Pressable style={s.card} onPress={() => router.push('/ai-tools/waste' as any)}>
        <View style={s.cardHead}>
          <Ionicons name="trash-outline" size={14} color="#0A0A0A" />
          <Text style={s.cardTitle}>Waste Analyzer</Text>
          <View style={{ flex: 1 }} />
          <View style={s.chevron}><Ionicons name="chevron-forward" size={14} color="#0A0A0A" /></View>
        </View>
        <Text style={s.cardDesc}>Identify recyclables and organic waste using real-time computer vision.</Text>
        {counts.waste > 0 && <Text style={s.cardMeta}>{counts.waste} scans</Text>}
      </Pressable>

      {/* AgriSense with image */}
      <Pressable style={s.imageCard} onPress={() => router.push('/ai-tools/agri' as any)}>
        <View style={s.imageTop}>
          <View style={s.imagePlaceholder}>
            <MaterialCommunityIcons name="sprout" size={42} color="#0A0A0A" />
            <Text style={s.imageSub}>Sensor Hub</Text>
          </View>
          <View style={s.syncBadge}><View style={s.dot} /><Text style={s.syncText}>Synced</Text></View>
        </View>
        <View style={s.imageBody}>
          <View style={s.cardHead}>
            <Ionicons name="leaf-outline" size={14} color="#0A0A0A" />
            <Text style={s.cardTitle}>AgriSense</Text>
            <View style={{ flex: 1 }} />
            <View style={s.chevron}><Ionicons name="chevron-forward" size={14} color="#0A0A0A" /></View>
          </View>
          <Text style={s.cardDesc}>Deep-soil manure and nutrient analysis for precision agriculture.</Text>
        </View>
      </Pressable>

      {/* PlantSense with leaf illu */}
      <Pressable style={s.imageCard} onPress={() => router.push('/ai-tools/plant' as any)}>
        <View style={[s.imageTop, { backgroundColor: '#FAFAFA' }]}>
          <View style={s.leafArt}>
            <MaterialCommunityIcons name="leaf" size={80} color="#0A0A0A" />
            <View style={s.orbit1} />
            <View style={s.orbit2} />
          </View>
          <View style={s.syncBadge}><View style={s.dot} /><Text style={s.syncText}>Active</Text></View>
          <View style={[s.tagVision, { position: 'absolute', left: 10, bottom: 10 }]}><Text style={s.tagText}>Botanical AI</Text></View>
        </View>
        <View style={s.imageBody}>
          <View style={s.cardHead}>
            <Ionicons name="heart-outline" size={14} color="#0A0A0A" />
            <Text style={s.cardTitle}>PlantSense</Text>
            <View style={{ flex: 1 }} />
            <View style={s.chevron}><Ionicons name="chevron-forward" size={14} color="#0A0A0A" /></View>
          </View>
          <Text style={s.cardDesc}>Early detection of plant diseases and physiological stress markers.</Text>
        </View>
      </Pressable>

      {/* System Performance */}
      <View style={s.secHead}>
        <Text style={s.secTitle}>System{'\n'}Performance</Text>
        <View style={s.allSys}><Text style={s.allSysText}>ALL SYSTEMS OPERATIONAL</Text></View>
      </View>
      <View style={s.perfRow}>
        <View style={s.perfCard}>
          <View style={s.perfHead}>
            <View style={s.perfIcon}><Ionicons name="flash-outline" size={14} color="#0A0A0A" /></View>
            <Ionicons name="settings-outline" size={12} color="#9CA3AF" />
          </View>
          <Text style={s.perfValue}>42ms</Text>
          <Text style={s.perfLabel}>MODEL LATENCY</Text>
        </View>
        <View style={s.perfCard}>
          <View style={s.perfHead}>
            <View style={s.perfIcon}><Ionicons name="stats-chart-outline" size={14} color="#0A0A0A" /></View>
            <View style={s.upPill}><Text style={s.upText}>↑ 2%</Text></View>
          </View>
          <Text style={s.perfValue}>99.9%</Text>
          <Text style={s.perfLabel}>SYNC UPTIME</Text>
        </View>
      </View>

      <View style={s.noteCard}>
        <View style={s.noteHead}><View style={s.noteIcon}><Ionicons name="information-circle-outline" size={14} color="#0A0A0A" /></View><Text style={s.noteKicker}>TECHNICAL NOTE</Text></View>
        <Text style={s.noteText}>Models are updated weekly with regional environmental data sets. Ensure your device is synced for the highest accuracy.</Text>
      </View>

      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  header: { gap: 6, paddingTop: 4 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.6 },
  title: { fontSize: 24, fontWeight: '800', color: '#0A0A0A', letterSpacing: -0.4 },
  sub: { fontSize: 12, lineHeight: 18, color: '#6B7280' },
  heroIllu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  heroBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0A0A0A' },
  heroBadgeText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  phoneMock: { marginTop: 8 },
  phoneOutline: {
    width: 110,
    height: 190,
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  phoneLeaf: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  produceRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  produceText: { fontSize: 10, color: '#9CA3AF' },
  tagVision: { alignSelf: 'flex-start', backgroundColor: '#0A0A0A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  tagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  card: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  cardDesc: { fontSize: 12, lineHeight: 18, color: '#6B7280' },
  cardMeta: { fontSize: 11, fontWeight: '600', color: '#0A0A0A', marginTop: 4 },
  chevron: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  imageCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, overflow: 'hidden' },
  imageTop: {
    height: 160,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imageSub: { fontSize: 10, color: '#9CA3AF' },
  syncBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  syncText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  imageBody: { padding: 14, gap: 6, backgroundColor: '#F9FAFA' },
  leafArt: { alignItems: 'center', justifyContent: 'center' },
  orbit1: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  orbit2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 },
  secTitle: { fontSize: 15, fontWeight: '800', color: '#0A0A0A', lineHeight: 18 },
  allSys: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F9FAFA' },
  allSysText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.4 },
  perfRow: { flexDirection: 'row', gap: 10 },
  perfCard: { flex: 1, backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, gap: 8 },
  perfHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  perfValue: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  perfLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  upPill: { backgroundColor: '#0A0A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  upText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  noteCard: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, gap: 8 },
  noteHead: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  noteIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  noteKicker: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  noteText: { fontSize: 11, lineHeight: 16, color: '#6B7280' },
});
