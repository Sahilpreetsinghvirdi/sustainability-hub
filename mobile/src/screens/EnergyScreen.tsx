import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const EnergyScreen: React.FC = () => {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.livePill}><Text style={s.liveText}>LIVE DATA</Text></View>
        <View style={s.gauge}><Ionicons name="flash" size={36} color="#0A0A0A" /><Ionicons name="radio-button-on" size={10} color="#0A0A0A" style={{ position: 'absolute' }} /></View>
      </View>
      <Text style={s.title}>Energy Insights</Text>
      <Text style={s.sub}>Detailed breakdown of your sustainable home energy patterns.</Text>
      <View style={s.twoCol}>
        <View style={s.metricCard}><View style={s.metricHead}><View style={s.metricIcon}><Ionicons name="sparkles-outline" size={14} color="#0A0A0A" /></View><View style={s.trendLight}><Text style={s.trendLightText}>↘ 12%</Text></View></View><Text style={s.kicker}>TOTAL USAGE</Text><Text style={s.value}>14.2<Text style={s.unit}> kWh</Text></Text></View>
        <View style={s.metricCard}><View style={s.metricHead}><View style={s.metricIcon}><Ionicons name="pulse-outline" size={14} color="#0A0A0A" /></View><View style={s.trendDark}><Text style={s.trendDarkText}>↗ 5%</Text></View></View><Text style={s.kicker}>EST. COST</Text><Text style={s.value}>$2.84<Text style={s.unit}> USD</Text></Text></View>
      </View>
      <View style={s.chartCard}>
        <View style={s.chartHead}><View><View style={s.row}><Ionicons name="time-outline" size={14} color="#0A0A0A" /><Text style={s.chartTitle}> Consumption Trend</Text></View><Text style={s.chartSub}>Hourly energy flow across your grid.</Text></View><View style={s.exportPill}><Text style={s.exportText}>EXPORT</Text></View></View>
        <View style={s.toggleRow}><View style={[s.togglePill, s.toggleActive]}><Text style={[s.toggleText, s.toggleTextActive]}>DAILY</Text></View><View style={s.togglePill}><Text style={s.toggleText}>WEEKLY</Text></View><View style={s.togglePill}><Text style={s.toggleText}>MONTHLY</Text></View></View>
        <View style={s.chartArea}><View style={s.chartLine} /></View>
        <View style={s.xAxis}><Text style={s.axis}>00:00</Text><Text style={s.axis}>04:00</Text><Text style={s.axis}>08:00</Text><Text style={s.axis}>12:00</Text><Text style={s.axis}>16:00</Text><Text style={s.axis}>20:00</Text><Text style={s.axis}>23:59</Text></View>
      </View>
      <View style={s.resCard}>
        <View style={s.resHead}><Ionicons name="water-outline" size={14} color="#0A0A0A" /><Text style={s.resTitle}> Resource Allocation</Text></View>
        <Text style={s.resSub}>Top energy consumers in your home.</Text>
        <View style={s.resItem}><Text style={s.resKicker}>HVAC SYSTEM</Text><Text style={s.resVal}>6.4<Text style={s.unit}> kWh</Text></Text></View><View style={s.track}><View style={[s.fill, { width: '45%' }]} /></View><Text style={s.resPct}>45% OF TOTAL</Text>
        <View style={s.resItem}><Text style={s.resKicker}>KITCHEN APPLIANCES</Text><Text style={s.resVal}>3.5<Text style={s.unit}> kWh</Text></Text></View><View style={s.track}><View style={[s.fill, { width: '25%' }]} /></View><Text style={s.resPct}>25% OF TOTAL</Text>
        <View style={s.resItem}><Text style={s.resKicker}>SMART LIGHTING</Text><Text style={s.resVal}>2.1<Text style={s.unit}> kWh</Text></Text></View><View style={s.track}><View style={[s.fill, { width: '15%' }]} /></View><Text style={s.resPct}>15% OF TOTAL</Text>
        <View style={s.resItem}><Text style={s.resKicker}>LAUNDRY SUITE</Text><Text style={s.resVal}>1.4<Text style={s.unit}> kWh</Text></Text></View><View style={s.track}><View style={[s.fill, { width: '10%' }]} /></View><Text style={s.resPct}>10% OF TOTAL</Text>
      </View>
      <Text style={s.optKicker}>OPTIMIZATION TIPS</Text>
      <Pressable style={s.tipBlack} onPress={() => router.push('/energy/appliances' as any)}><View style={s.tipIconWhite}><Ionicons name="flash-outline" size={14} color="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={s.tipTitle}>PEAK RATE ALERT</Text><Text style={s.tipSub}>Prices increase in 45 mins. Consider shifting heavy laundry to 10:00 PM.</Text></View><Ionicons name="chevron-forward" size={14} color="#FFFFFF" /></Pressable>
      <Pressable style={s.tipLight}><View style={s.tipIcon}><Ionicons name="warning-outline" size={14} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.tipTitleLight}>EFFICIENCY DROP</Text><Text style={s.tipSubLight}>Kitchen usage is 15% higher than usual. Check refrigerator seals.</Text></View><Ionicons name="chevron-forward" size={14} color="#0A0A0A" /></Pressable>
      <View style={s.rankCard}><View style={s.rankIcon}><Ionicons name="information-circle-outline" size={18} color="#0A0A0A" /></View><Text style={s.rankTitle}>Community Ranking</Text><Text style={s.rankSub}>You are currently in the Top 15% of eco-efficient homes in your neighborhood.</Text><Pressable style={s.rankBtn}><Text style={s.rankBtnText}>COMPARE NEIGHBORS</Text></Pressable></View>
      <View style={s.switchRow}><Pressable style={s.switchPill} onPress={() => router.replace('/carbon' as any)}><Text style={s.switchText}>Carbon</Text></Pressable><Pressable style={[s.switchPill, s.switchActive]}><Text style={[s.switchText, s.switchTextActive]}>Energy</Text></Pressable><Pressable style={s.switchPill} onPress={() => router.replace('/food-waste' as any)}><Text style={s.switchText}>Waste</Text></Pressable></View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  hero: { height: 140, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  livePill: { position: 'absolute', left: 10, top: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  liveText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A' },
  gauge: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: '#0A0A0A' },
  sub: { fontSize: 11, color: '#6B7280', marginTop: -8 },
  twoCol: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 12, gap: 6 },
  metricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  trendLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  trendLightText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  trendDark: { backgroundColor: '#0A0A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  trendDarkText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  kicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6, marginTop: 4 },
  value: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  unit: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  chartCard: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 10 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  chartSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  exportPill: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFFFFF' },
  exportText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  toggleRow: { flexDirection: 'row', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, padding: 4 },
  togglePill: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 9999 },
  toggleActive: { backgroundColor: '#0A0A0A' },
  toggleText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  toggleTextActive: { color: '#FFFFFF' },
  chartArea: { height: 80, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, backgroundColor: '#FFFFFF', padding: 8 },
  chartLine: { flex: 1, borderWidth: 1.5, borderColor: '#0A0A0A', borderRadius: 8, opacity: 0.8 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  axis: { fontSize: 8, color: '#9CA3AF' },
  resCard: { backgroundColor: '#F9FAFA', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 14, gap: 8 },
  resHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  resSub: { fontSize: 11, color: '#6B7280' },
  resItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  resKicker: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  resVal: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  track: { height: 4, backgroundColor: '#EAEAEA', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: '#0A0A0A' },
  resPct: { fontSize: 9, color: '#9CA3AF', alignSelf: 'flex-end' },
  optKicker: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 0.6, marginTop: 4 },
  tipBlack: { backgroundColor: '#0A0A0A', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  tipIconWhite: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  tipSub: { fontSize: 11, lineHeight: 14, color: '#E5E7EB', marginTop: 2 },
  tipLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  tipIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  tipTitleLight: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  tipSubLight: { fontSize: 11, lineHeight: 14, color: '#6B7280', marginTop: 2 },
  rankCard: { borderWidth: 1, borderColor: '#E5E5E5', borderStyle: 'dashed', borderRadius: 16, padding: 14, gap: 6, alignItems: 'center', backgroundColor: '#FAFAFA' },
  rankIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  rankTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  rankSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', textAlign: 'center' },
  rankBtn: { backgroundColor: '#EAEAEA', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  rankBtnText: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  switchRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4 },
  switchPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  switchActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  switchText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  switchTextActive: { color: '#FFFFFF' },
});
