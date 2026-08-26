import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import logo from '@/assets/logo.png';

export default function TopNavigation() {
  const router = useRouter();
  const onMenu = () => {
    Alert.alert('Menu', 'Choose destination', [
      { text: 'Home', onPress: () => router.push('/' as any) },
      { text: 'AI Tools', onPress: () => router.push('/ai-tools' as any) },
      { text: 'Stats', onPress: () => router.push('/carbon' as any) },
      { text: 'Settings', onPress: () => router.push('/settings' as any) },
      { text: 'Profile', onPress: () => router.push('/settings/profile' as any) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  return (
    <View style={styles.shell}>
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}><Image source={logo} style={styles.logoImg} /></View>
        <Text style={styles.brandTitle}>Sustainability Hub</Text>
      </View>
      <Pressable onPress={onMenu} style={styles.menuBtn} accessibilityLabel="Menu">
        <Ionicons name="menu" size={22} color="#0A0A0A" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg: { width: 30, height: 30, borderRadius: 15 },
  brandTitle: { fontSize: 15, fontWeight: '700', color: '#0A0A0A', letterSpacing: -0.2 },
  menuBtn: { padding: 4 },
});
