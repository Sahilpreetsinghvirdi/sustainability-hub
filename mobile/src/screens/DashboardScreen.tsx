import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCarbonStore } from '@/store/carbonStore';
import { useEnergyStore } from '@/store/energyStore';
import { useFoodWasteStore } from '@/store/foodWasteStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSettingsStore } from '@/store/settingsStore';
import { themeDark, themeLight } from '@/constants/theme';

export const DashboardScreen: React.FC = () => {
  const scans = useCarbonStore(s => s.scans);
  const bills = useEnergyStore(s => s.bills);
  const logs = useFoodWasteStore(s => s.logs);
  const streak = useFoodWasteStore(s => s.streak);
  const totalCarbon = scans.reduce((sum: number, s: any) => sum + (s.total_carbon_kg || 0), 0);
  const totalEnergy = bills.reduce((sum: number, b: any) => sum + (b.electricity_kwh || 0), 0);
  const totalWaste = logs.reduce((sum: number, l: any) => sum + (l.avoidable_waste_kg || 0), 0);
  const days = streak?.current_streak_days || 0;
  const hasData = scans.length > 0 || bills.length > 0 || logs.length > 0;
  const isDark = useSettingsStore(s => s.theme) === 'dark';
  const palette = isDark ? themeDark : themeLight;
  return (
    <ScrollView style={[s.container, { backgroundColor: palette.bg }]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* DAILY STREAK */}
      <Animated.View entering={FadeInDown.duration(320).delay(40)} style={s.streakCard}>
        <View style={s.streakBgLeaf}>
          <MaterialCommunityIcons name="leaf" size={120} color="rgba(255,255,255,0.06)" />
        </View>
        <View style={s.streakRow}>
          <Ionicons name="flame-outline" size={14} color="#FFFFFF" />
          <Text style={s.streakKicker}>DAILY STREAK</Text>
        </View>
        <Text style={s.streakValue}>{days} {days === 1 ? 'Day' : 'Days'}</Text>
        <View style={s.streakMetaRow}>
          <Text style={s.streakLevel}>Level {Math.min(4, Math.floor(days / 3) + 1)} Sustainability Guardian</Text>
          <Text style={s.streakXp}>{days * 38} / 600 XP</Text>
        </View>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${Math.min(100, (days * 38 / 600) * 100)}%` }]} />
        </View>
      </Animated.View>

      {/* Weekly Overview */}
      <Animated.View entering={FadeInDown.duration(320).delay(80)} style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Weekly Overview</Text>
          <View style={s.pillLight}>
            <Ionicons name="calendar-outline" size={12} color="#0A0A0A" />
            <Text style={s.pillLightText}>This Week</Text>
          </View>
        </View>
        <View style={s.overviewGrid}>
          <View style={s.overviewCard}>
            <View style={s.overviewHead}>
              <View style={s.iconCircle}><Ionicons name="trending-down" size={14} color="#0A0A0A" /></View>
              <Text style={s.overviewLabel}>CARBON</Text>
              <View style={s.badgeBlack}><Text style={s.badgeBlackText}>-15%</Text></View>
            </View>
            <Text style={s.overviewValue}>{totalCarbon.toFixed(1)}<Text style={s.overviewUnit}> kg CO2e</Text></Text>
            <Text style={s.overviewSub}>{hasData ? 'This week' : 'No data yet — log consumption'}</Text>
          </View>
          <View style={s.overviewCard}>
            <View style={s.overviewHead}>
              <View style={s.iconCircle}><Ionicons name="flash" size={14} color="#0A0A0A" /></View>
              <Text style={s.overviewLabel}>ENERGY</Text>
              <View style={s.badgeBlack}><Text style={s.badgeBlackText}>{totalEnergy > 0 ? '-' : '0%'}</Text></View>
            </View>
            <Text style={s.overviewValue}>{totalEnergy.toFixed(1)}<Text style={s.overviewUnit}> kWh</Text></Text>
            <Text style={s.overviewSub}>{hasData ? 'Optimized heating' : 'No data yet'}</Text>
          </View>
          <View style={[s.overviewCard, { width: '100%' }]}>
            <View style={s.overviewHead}>
              <View style={s.iconCircle}><Ionicons name="trash-outline" size={14} color="#0A0A0A" /></View>
              <Text style={s.overviewLabel}>FOOD WASTE</Text>
              <View style={s.badgeLight}><Text style={s.badgeLightText}>{totalWaste > 0 ? '+8%' : '0%'}</Text></View>
            </View>
            <Text style={s.overviewValue}>{totalWaste.toFixed(1)}<Text style={s.overviewUnit}> kg</Text></Text>
            <Text style={s.overviewSub}>{hasData ? 'Meal prep planned' : 'No waste logged yet'}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.duration(320).delay(120)} style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <Pressable style={s.actionRow} onPress={() => router.push('/carbon/manual' as any)}>
          <View style={s.actionIcon}><Ionicons name="add" size={20} color="#FFFFFF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>Log Consumption</Text>
            <Text style={s.actionSub}>Manual entry for water or gas</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
        <Pressable style={s.actionRow} onPress={() => router.push('/ai-tools/waste' as any)}>
          <View style={s.actionIcon}><Ionicons name="checkmark" size={18} color="#FFFFFF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>AI Waste Scan</Text>
            <Text style={s.actionSub}>Scan organic waste for analysis</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View entering={FadeInDown.duration(320).delay(160)} style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <Pressable onPress={() => { if (logs.length > 0) router.push('/food-waste' as any); }}><Text style={s.viewAll}>View All</Text></Pressable>
        </View>
        {hasData ? (
          <View style={s.activityCard}>
            {scans.slice(0, 1).map((sc: any) => (
              <View key={sc.id} style={s.activityRow}>
                <View style={s.activityIcon}><Ionicons name="leaf-outline" size={14} color="#0A0A0A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>{(sc.store_name || 'CARBON ENTRY').toUpperCase()}</Text>
                  <Text style={s.activityTime}>Just now</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.activityRight}>{sc.total_carbon_kg.toFixed(1)} kg</Text>
                  <Text style={s.activityMetaGreen}>SYNCED</Text>
                </View>
              </View>
            ))}
            {bills.slice(0, 1).map((b: any) => (
              <View key={b.id} style={s.activityRow}>
                <View style={s.activityIcon}><Ionicons name="flash-outline" size={14} color="#0A0A0A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>{(b.utility_provider || 'ENERGY ENTRY').toUpperCase()}</Text>
                  <Text style={s.activityTime}>Just now</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.activityRight}>{b.electricity_kwh.toFixed(1)} kWh</Text>
                  <Text style={s.activityMetaGreen}>SAVED</Text>
                </View>
              </View>
            ))}
            {logs.slice(0, 2).map((l: any) => (
              <View key={l.id} style={s.activityRow}>
                <View style={s.activityIcon}><Ionicons name="trash-outline" size={14} color="#0A0A0A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>{l.meal_type.toUpperCase()} WASTE</Text>
                  <Text style={s.activityTime}>Just now</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.activityRight}>{l.avoidable_waste_kg.toFixed(1)} kg</Text>
                  <Text style={s.activityMetaGreen}>LOGGED</Text>
                </View>
              </View>
            ))}
            {scans.length === 0 && bills.length === 0 && logs.length === 0 && (
              <View style={s.activityRow}>
                <View style={s.activityIcon}><Ionicons name="information-circle-outline" size={14} color="#0A0A0A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>WELCOME TO SUSTAINABILITY HUB</Text>
                  <Text style={s.activityTime}>Start by logging consumption</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.activityRight}>0.0 kg</Text>
                  <Text style={s.activityMetaGreen}>NEW</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={s.activityCard}>
            <View style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
              <Ionicons name="leaf-outline" size={28} color="#9CA3AF" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>No activity yet</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>Log your first consumption, energy bill or waste meal to see activity here.</Text>
              <Pressable style={{ marginTop: 8, backgroundColor: '#0A0A0A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 }} onPress={() => router.push('/carbon/manual' as any)}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Log First Entry</Text></Pressable>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Eco Tip */}
      <Animated.View entering={FadeInUp.duration(320).delay(200)} style={s.tipCard}>
        <View style={s.tipHead}>
          <View style={s.tipIcon}><Ionicons name="information-circle-outline" size={16} color="#0A0A0A" /></View>
          <Text style={s.tipKicker}>ECO TIP</Text>
        </View>
        <Text style={s.tipText}>Turning down your thermostat by just 1°C can reduce your heating bill (and carbon footprint) by up to 10% per year.</Text>
        <Pressable style={s.tipFab} onPress={() => router.push('/energy' as any)}>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '-45deg' }] }} />
        </Pressable>
      </Animated.View>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 20, paddingBottom: 28 },
  streakCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  streakBgLeaf: { position: 'absolute', right: -10, top: 12, opacity: 1 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakKicker: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, opacity: 0.9 },
  streakValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  streakMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  streakLevel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', opacity: 0.9 },
  streakXp: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  xpTrack: { height: 6, backgroundColor: '#2D2D2D', borderRadius: 9999, marginTop: 8, overflow: 'hidden' },
  xpFill: { height: 6, backgroundColor: '#FFFFFF', borderRadius: 9999 },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0A0A0A', letterSpacing: -0.2 },
  viewAll: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  pillLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillLightText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewCard: {
    width: '48%',
    backgroundColor: '#F9FAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  overviewHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6, flex: 1 },
  badgeBlack: { backgroundColor: '#0A0A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  badgeBlackText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  badgeLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  badgeLightText: { color: '#0A0A0A', fontSize: 10, fontWeight: '700' },
  overviewValue: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  overviewUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  overviewSub: { fontSize: 11, color: '#6B7280', marginTop: -2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 14,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  actionSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 12,
    gap: 0,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.4 },
  activityTime: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  activityRight: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', fontFamily: 'monospace' },
  activityMetaGreen: { fontSize: 10, fontWeight: '700', color: '#0A0A0A', marginTop: 2, letterSpacing: 0.4 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  tipCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    position: 'relative',
    paddingBottom: 20,
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  tipKicker: { fontSize: 11, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  tipText: { fontSize: 12, lineHeight: 18, color: '#374151', marginTop: 4, paddingRight: 40 },
  tipFab: {
    position: 'absolute',
    right: 12,
    bottom: -14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
