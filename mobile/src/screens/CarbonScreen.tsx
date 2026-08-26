import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const CarbonScreen: React.FC = () => {
  const [period] = useState('6M');
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.livePill}><Text style={s.liveText}>LIVE METRICS</Text></View>
        <View style={s.treeArt}><MaterialCommunityIcons name="tree-outline" size={56} color="#0A0A0A" /><View style={s.city}><Ionicons name="business-outline" size={14} color="#0A0A0A" /><Ionicons name="business-outline" size={10} color="#0A0A0A" /></View></View>
      </View>

      <View style={s.twoCol}>
        <View style={s.metricCard}>
          <View style={s.metricHead}><View style={s.metricIcon}><Ionicons name="leaf-outline" size={14} color="#0A0A0A" /></View><View style={s.trendDown}><Ionicons name="trending-down" size={10} color="#FFFFFF" /><Text style={s.trendText}> 4.2%</Text></View></View>
          <Text style={s.metricKicker}>DAILY AVG</Text>
          <Text style={s.metricValue}>12.4<Text style={s.unit}> kg</Text></Text>
        </View>
        <View style={s.metricCard}>
          <View style={s.metricHead}><View style={s.metricIcon}><Ionicons name="globe-outline" size={14} color="#0A0A0A" /></View><View style={[s.trendDown, { backgroundColor: '#0A0A0A' }]}><Text style={[s.trendText, { color: '#FFFFFF' }]}>↗ 1.8%</Text></View></View>
          <Text style={s.metricKicker}>MONTHLY</Text>
          <Text style={s.metricValue}>342<Text style={s.unit}> kg</Text></Text>
        </View>
      </View>

      <View style={s.chartCard}>
        <View style={s.chartHead}><View><Text style={s.chartTitle}>Efficiency Trend</Text><Text style={s.chartSub}>Footprint over last 6 months</Text></View><View style={s.periodPill}><Ionicons name="calendar-outline" size={12} color="#0A0A0A" /><Text style={s.periodText}>6M</Text></View></View>
        <View style={s.chartArea}>
          <View style={s.chartGrid} />
          <View style={s.chartLine} />
          <View style={s.chartYLabels}><Text style={s.yLabel}>600</Text><Text style={s.yLabel}>450</Text><Text style={s.yLabel}>300</Text><Text style={s.yLabel}>150</Text><Text style={s.yLabel}>0</Text></View>
          <View style={s.xRow}><Text style={s.xLabel}>Jan</Text><Text style={s.xLabel}>Feb</Text><Text style={s.xLabel}>Mar</Text><Text style={s.xLabel}>Apr</Text><Text style={s.xLabel}>May</Text><Text style={s.xLabel}>Jun</Text></View>
        </View>
      </View>

      <View style={s.secHead}><View style={s.secLeft}><Ionicons name="stats-chart-outline" size={14} color="#0A0A0A" /><Text style={s.secTitle}>Footprint Breakdown</Text></View><Pressable onPress={() => router.push('/carbon/manual' as any)} style={s.viewAllRow}><Text style={s.viewAll}>View All</Text><Ionicons name="chevron-forward" size={12} color="#0A0A0A" /></Pressable></View>
      <View style={s.breakCard}>
        <View style={s.breakHead}><View style={s.breakIcon}><Ionicons name="car-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.breakTitle}>TRANSPORT</Text><Text style={s.breakSub}>120 kg CO2e</Text></View><Text style={s.breakPct}>-12%</Text></View>
        <View style={s.track}><View style={[s.fill, { width: '55%' }]} /></View>
      </View>
      <View style={s.breakCard}>
        <View style={s.breakHead}><View style={s.breakIcon}><Ionicons name="flash-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.breakTitle}>ENERGY</Text><Text style={s.breakSub}>85 kg CO2e</Text></View><Text style={s.breakPct}>+5%</Text></View>
        <View style={s.track}><View style={[s.fill, { width: '42%' }]} /></View>
      </View>
      <View style={s.breakCard}>
        <View style={s.breakHead}><View style={s.breakIcon}><Ionicons name="restaurant-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.breakTitle}>FOOD</Text><Text style={s.breakSub}>45 kg CO2e</Text></View><Text style={s.breakPct}>-8%</Text></View>
        <View style={s.track}><View style={[s.fill, { width: '30%' }]} /></View>
      </View>

      <View style={s.tipBlack}>
        <View style={s.tipHead}><View style={s.tipIconWhite}><Ionicons name="information-circle-outline" size={14} color="#FFFFFF" /></View><Text style={s.tipBlackTitle}>Did you know?</Text></View>
        <Text style={s.tipBlackText}>Switching to LED bulbs can reduce your lighting carbon footprint by up to 75%.</Text>
        <Pressable style={s.whiteBtn} onPress={() => router.push('/carbon/manual' as any)}><Text style={s.whiteBtnText}>Calculate New Activity</Text></Pressable>
      </View>

      <View style={s.switchRow}>
        <Pressable style={[s.switchPill, s.switchActive]}><Text style={[s.switchText, s.switchTextActive]}>Carbon</Text></Pressable>
        <Pressable style={s.switchPill} onPress={() => router.replace('/energy' as any)}><Text style={s.switchText}>Energy</Text></Pressable>
        <Pressable style={s.switchPill} onPress={() => router.replace('/food-waste' as any)}><Text style={s.switchText}>Waste</Text></Pressable>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  hero: { height: 140, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  livePill: { position: 'absolute', left: 10, top: 10, backgroundColor: '#0A0A0A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  treeArt: { alignItems: 'center' },
  city: { flexDirection: 'row', gap: 4, marginTop: -6 },
  twoCol: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, gap: 6 },
  metricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  trendDown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5' },
  trendText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  metricKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  metricValue: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  unit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chartCard: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 10 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartTitle: { fontSize: 15, fontWeight: '800', color: '#0A0A0A' },
  chartSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  periodPill: { flexDirection: 'row', gap: 4, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFFFFF' },
  periodText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  chartArea: { height: 120, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', padding: 8, overflow: 'hidden' },
  chartGrid: { position: 'absolute', left: 30, right: 10, top: 10, bottom: 20, borderTopWidth: 1, borderColor: '#F3F4F6' },
  chartLine: { position: 'absolute', left: 30, right: 10, top: 18, height: 60, borderWidth: 1.5, borderColor: '#0A0A0A', borderRadius: 8, opacity: 0.9 },
  chartYLabels: { position: 'absolute', left: 0, top: 0, bottom: 16, justifyContent: 'space-between', paddingVertical: 6 },
  yLabel: { fontSize: 8, color: '#9CA3AF' },
  xRow: { position: 'absolute', left: 30, right: 10, bottom: 2, flexDirection: 'row', justifyContent: 'space-between' },
  xLabel: { fontSize: 8, color: '#9CA3AF' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  secLeft: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  secTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  viewAllRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  breakCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 8, backgroundColor: '#FFFFFF' },
  breakHead: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  breakIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  breakTitle: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.4 },
  breakSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  breakPct: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  track: { height: 6, backgroundColor: '#EAEAEA', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: '#0A0A0A', borderRadius: 9999 },
  tipBlack: { backgroundColor: '#0A0A0A', borderRadius: 16, padding: 14, gap: 8 },
  tipHead: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tipIconWhite: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tipBlackTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  tipBlackText: { fontSize: 11, lineHeight: 16, color: '#E5E7EB' },
  whiteBtn: { backgroundColor: '#FFFFFF', borderRadius: 9999, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  whiteBtnText: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  switchRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4 },
  switchPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  switchActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  switchText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  switchTextActive: { color: '#FFFFFF' },
});
