import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const FoodWasteScreen: React.FC = () => {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.livePill}><View style={s.dot} /><Text style={s.liveText}>Live Tracking</Text></View>
        <View style={s.binCircle}><Ionicons name="trash-outline" size={48} color="#0A0A0A" /><View style={s.appleBadge}><Text style={s.apple}>🍎</Text></View></View>
      </View>
      <Text style={s.title}>Waste Analytics</Text>
      <Text style={s.sub}>Monitor your organic cycle efficiency.</Text>
      <Pressable style={s.blackBtn} onPress={() => router.push('/food-waste/log' as any)}><Ionicons name="add" size={16} color="#FFFFFF" /><Text style={s.blackBtnText}>LOG NEW WASTE</Text></Pressable>

      <View style={s.secHead}><Ionicons name="leaf-outline" size={14} color="#0A0A0A" /><Text style={s.secTitle}>Compost Health</Text><Text style={s.secRight}>BIN #01 - ACTIVE</Text></View>
      <View style={s.healthRow}>
        <View style={s.healthCard}><View style={s.healthIcon}><Ionicons name="water-outline" size={16} color="#0A0A0A" /></View><Text style={s.healthKicker}>MOISTURE</Text><Text style={s.healthValue}>64%</Text><View style={s.healthBadge}><Text style={s.healthBadgeText}>OPTIMAL</Text></View></View>
        <View style={s.healthCard}><View style={s.healthIcon}><Ionicons name="thermometer-outline" size={16} color="#0A0A0A" /></View><Text style={s.healthKicker}>TEMP</Text><Text style={s.healthValue}>52°C</Text><View style={[s.healthBadge, { backgroundColor: '#0A0A0A' }]}><Text style={[s.healthBadgeText, { color: '#FFFFFF' }]}>HIGH</Text></View></View>
        <View style={s.healthCard}><View style={s.healthIcon}><Ionicons name="filter-outline" size={16} color="#0A0A0A" /></View><Text style={s.healthKicker}>AIRFLOW</Text><Text style={s.healthValue}>Good</Text><View style={s.healthBadge}><Text style={s.healthBadgeText}>STABLE</Text></View></View>
      </View>
      <View style={s.progressCard}>
        <View style={s.progressHead}><Text style={s.progressKicker}>DECOMPOSITION PROGRESS</Text><Text style={s.progressVal}>72%</Text></View>
        <View style={s.track}><View style={[s.fill, { width: '72%' }]} /></View>
        <View style={s.progressNote}><Ionicons name="information-circle-outline" size={12} color="#6B7280" /><Text style={s.progressNoteText}>Optimal temperature reached. Estimated completion in 12 days.</Text></View>
      </View>

      <View style={s.chartCard}>
        <View style={s.chartHead}><View style={s.chartTitleRow}><Ionicons name="stats-chart-outline" size={14} color="#0A0A0A" /><Text style={s.chartTitle}> Weekly Trends</Text></View><View style={s.datePill}><Text style={s.dateText}>OCT 18-24</Text></View></View>
        <View style={s.barArea}>
          {[
            { w: 18, g: 8 }, { w: 10, g: 16 }, { w: 30, g: 6 }, { w: 22, g: 10 }, { w: 12, g: 4 }, { w: 26, g: 6 }, { w: 20, g: 8 },
          ].map((b, i) => (
            <View key={i} style={s.barGroup}>
              <View style={s.barStack}>
                <View style={[s.barDark, { height: b.w * 2 }]} />
                <View style={[s.barLight, { height: b.g * 2 }]} />
              </View>
              <Text style={s.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</Text>
            </View>
          ))}
        </View>
        <View style={s.legend}><View style={s.legendDotDark} /><Text style={s.legendText}>Composted</Text><View style={s.legendDotLight} /><Text style={s.legendText}>Landfill</Text></View>
      </View>

      <View style={s.secHead}><Ionicons name="time-outline" size={14} color="#0A0A0A" /><Text style={s.secTitle}>Recent Logs</Text><Text style={s.viewAll}>VIEW ALL</Text></View>
      <View style={s.logCard}><View style={s.logIconDark}><Ionicons name="leaf-outline" size={16} color="#FFFFFF" /></View><View style={{ flex: 1 }}><View style={s.logHead}><Text style={s.logTitle}>VEGETABLE SCRAPS</Text><Text style={s.logRight}>-0.8KG CO2</Text></View><Text style={s.logSub}>Oct 24 • 1.2 kg</Text></View><Ionicons name="chevron-forward" size={14} color="#9CA3AF" /></View>
      <View style={s.logCard}><View style={s.logIconLight}><Ionicons name="trash-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><View style={s.logHead}><Text style={s.logTitle}>EXPIRED DAIRY</Text><Text style={[s.logRight, { color: '#0A0A0A' }]}>+1.2KG CO2</Text></View><Text style={s.logSub}>Oct 22 • 0.4 kg</Text></View><Ionicons name="chevron-forward" size={14} color="#9CA3AF" /></View>
      <View style={s.logCard}><View style={s.logIconDark}><Ionicons name="leaf-outline" size={16} color="#FFFFFF" /></View><View style={{ flex: 1 }}><View style={s.logHead}><Text style={s.logTitle}>FRUIT PEELS</Text><Text style={s.logRight}>-0.5KG CO2</Text></View><Text style={s.logSub}>Oct 21 • 0.8 kg</Text></View><Ionicons name="chevron-forward" size={14} color="#9CA3AF" /></View>

      <View style={s.switchRow}><Pressable style={s.switchPill} onPress={() => router.replace('/carbon' as any)}><Text style={s.switchText}>Carbon</Text></Pressable><Pressable style={s.switchPill} onPress={() => router.replace('/energy' as any)}><Text style={s.switchText}>Energy</Text></Pressable><Pressable style={[s.switchPill, s.switchActive]}><Text style={[s.switchText, s.switchTextActive]}>Waste</Text></Pressable></View>

      <Pressable style={s.fab} onPress={() => router.push('/food-waste/log' as any)}><Ionicons name="add" size={20} color="#FFFFFF" /></Pressable>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  hero: { height: 160, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  livePill: { position: 'absolute', left: 10, top: 10, flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A' },
  binCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  appleBadge: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', bottom: -2, right: -2 },
  apple: { fontSize: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  sub: { fontSize: 11, color: '#6B7280', marginTop: -8 },
  blackBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  blackBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  secHead: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  secTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A', flex: 1 },
  secRight: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  healthRow: { flexDirection: 'row', gap: 8 },
  healthCard: { flex: 1, backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 10, gap: 6, alignItems: 'center' },
  healthIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  healthKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  healthValue: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  healthBadge: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  healthBadgeText: { fontSize: 9, fontWeight: '700', color: '#0A0A0A' },
  progressCard: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 8 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between' },
  progressKicker: { fontSize: 10, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.6 },
  progressVal: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  track: { height: 6, backgroundColor: '#EAEAEA', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: '#0A0A0A' },
  progressNote: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  progressNoteText: { fontSize: 10, color: '#6B7280', flex: 1 },
  chartCard: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 10 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  datePill: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  dateText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  barArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 90, paddingHorizontal: 6 },
  barGroup: { alignItems: 'center', gap: 4, flex: 1 },
  barStack: { flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'flex-end', height: 70 },
  barDark: { width: 12, backgroundColor: '#0A0A0A', borderRadius: 4 },
  barLight: { width: 12, backgroundColor: '#D1D5DB', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#6B7280' },
  legend: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  legendDotDark: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0A0A0A' },
  legendDotLight: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  legendText: { fontSize: 11, color: '#6B7280', marginRight: 8 },
  logCard: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF' },
  logIconDark: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  logIconLight: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  logHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  logRight: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  logSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  switchRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4 },
  switchPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  switchActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  switchText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  switchTextActive: { color: '#FFFFFF' },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
});
