import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import logo from '@/assets/logo.png';

export default function TopNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const go = (path: string) => { setMenuOpen(false); router.push(path as any); };
  return (
    <>
      <View style={styles.shell}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}><Image source={logo} style={styles.logoImg} /></View>
          <Text style={styles.brandTitle}>Sustainability Hub</Text>
        </View>
        <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} accessibilityLabel="Menu">
          <Ionicons name="menu" size={22} color="#0A0A0A" />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHead}><Text style={styles.sheetTitle}>Menu</Text><Pressable onPress={() => setMenuOpen(false)}><Ionicons name="close" size={20} color="#0A0A0A" /></Pressable></View>
            <Pressable style={styles.item} onPress={() => go('/')}><Ionicons name="home-outline" size={18} color="#0A0A0A" /><Text style={styles.itemText}>Home</Text></Pressable>
            <Pressable style={styles.item} onPress={() => go('/ai-tools')}><Ionicons name="sparkles-outline" size={18} color="#0A0A0A" /><Text style={styles.itemText}>AI Tools</Text></Pressable>
            <Pressable style={styles.item} onPress={() => go('/carbon')}><Ionicons name="stats-chart-outline" size={18} color="#0A0A0A" /><Text style={styles.itemText}>Stats</Text></Pressable>
            <Pressable style={styles.item} onPress={() => go('/settings')}><Ionicons name="settings-outline" size={18} color="#0A0A0A" /><Text style={styles.itemText}>Settings</Text></Pressable>
            <Pressable style={styles.item} onPress={() => go('/settings/profile')}><Ionicons name="person-outline" size={18} color="#0A0A0A" /><Text style={styles.itemText}>Profile</Text></Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg: { width: 30, height: 30, borderRadius: 15 },
  brandTitle: { fontSize: 15, fontWeight: '700', color: '#0A0A0A', letterSpacing: -0.2 },
  menuBtn: { padding: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 12 },
  sheet: { width: 260, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 4, borderWidth: 1, borderColor: '#E5E5E5' },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 4 },
  sheetTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.6 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  itemText: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
});
