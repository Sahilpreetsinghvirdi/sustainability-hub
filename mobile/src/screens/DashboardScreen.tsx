import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* DAILY STREAK */}
      <View style={s.streakCard}>
        <View style={s.streakBgLeaf}>
          <MaterialCommunityIcons name="leaf" size={120} color="rgba(255,255,255,0.06)" />
        </View>
        <View style={s.streakRow}>
          <Ionicons name="flame-outline" size={14} color="#FFFFFF" />
          <Text style={s.streakKicker}>DAILY STREAK</Text>
        </View>
        <Text style={s.streakValue}>12 Days</Text>
        <View style={s.streakMetaRow}>
          <Text style={s.streakLevel}>Level 4 Sustainability Guardian</Text>
          <Text style={s.streakXp}>450 / 600 XP</Text>
        </View>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: '75%' }]} />
        </View>
      </View>

      {/* Weekly Overview */}
      <View style={s.section}>
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
            <Text style={s.overviewValue}>12.4<Text style={s.overviewUnit}> kg CO2e</Text></Text>
            <Text style={s.overviewSub}>Down from last week</Text>
          </View>
          <View style={s.overviewCard}>
            <View style={s.overviewHead}>
              <View style={s.iconCircle}><Ionicons name="flash" size={14} color="#0A0A0A" /></View>
              <Text style={s.overviewLabel}>ENERGY</Text>
              <View style={s.badgeBlack}><Text style={s.badgeBlackText}>-4%</Text></View>
            </View>
            <Text style={s.overviewValue}>48.2<Text style={s.overviewUnit}> kWh</Text></Text>
            <Text style={s.overviewSub}>Optimized heating</Text>
          </View>
          <View style={[s.overviewCard, { width: '100%' }]}>
            <View style={s.overviewHead}>
              <View style={s.iconCircle}><Ionicons name="trash-outline" size={14} color="#0A0A0A" /></View>
              <Text style={s.overviewLabel}>FOOD WASTE</Text>
              <View style={s.badgeLight}><Text style={s.badgeLightText}>+8%</Text></View>
            </View>
            <Text style={s.overviewValue}>1.8<Text style={s.overviewUnit}> kg</Text></Text>
            <Text style={s.overviewSub}>Meal prep planned</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={s.section}>
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
      </View>

      {/* Recent Activity */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <Text style={s.viewAll}>View All</Text>
        </View>
        <View style={s.activityCard}>
          <View style={s.activityRow}>
            <View style={s.activityIcon}><Ionicons name="trash-outline" size={14} color="#0A0A0A" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.activityTitle}>COMPOSTED APPLE CORE</Text>
              <Text style={s.activityTime}>2 hours ago</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.activityRight}>0.2  kg</Text>
              <Text style={s.activityMetaGreen}>SYNCED</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.activityRow}>
            <View style={s.activityIcon}><Ionicons name="flash-outline" size={14} color="#0A0A0A" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.activityTitle}>SMART PLUG AUTO-OFF</Text>
              <Text style={s.activityTime}>5 hours ago</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.activityRight}>0.45  kWh</Text>
              <Text style={s.activityMetaGreen}>SAVED</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.activityRow}>
            <View style={s.activityIcon}><Ionicons name="trending-down" size={14} color="#0A0A0A" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.activityTitle}>WEEKLY REPORT READY</Text>
              <Text style={s.activityTime}>Yesterday</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.activityRight}>Overall -12%</Text>
              <Text style={s.activityMetaGreen}> </Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.activityRow}>
            <View style={s.activityIcon}><Ionicons name="checkmark-circle-outline" size={14} color="#0A0A0A" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.activityTitle}>DAILY GOAL REACHED</Text>
              <Text style={s.activityTime}>Yesterday</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.activityRight}>+50  XP</Text>
              <Text style={s.activityMetaGreen}> </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Eco Tip */}
      <View style={s.tipCard}>
        <View style={s.tipHead}>
          <View style={s.tipIcon}><Ionicons name="information-circle-outline" size={16} color="#0A0A0A" /></View>
          <Text style={s.tipKicker}>ECO TIP</Text>
        </View>
        <Text style={s.tipText}>Turning down your thermostat by just 1°C can reduce your heating bill (and carbon footprint) by up to 10% per year.</Text>
        <Pressable style={s.tipFab} onPress={() => router.push('/energy' as any)}>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '-45deg' }] }} />
        </Pressable>
      </View>

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
