import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import logo from '@/assets/logo.png';

export default function TopNavigation() {
  return (
    <View style={styles.shell}>
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Image source={logo} style={styles.logoImg} />
        </View>
        <Text style={styles.brandTitle}>Sustainability Hub</Text>
      </View>
      <Pressable style={styles.menuBtn} accessibilityLabel="Menu">
        <Ionicons name="menu" size={22} color={colors.text.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 30, height: 30, borderRadius: 15 },
  brandTitle: { fontSize: 15, fontWeight: '700', color: '#0A0A0A', letterSpacing: -0.2 },
  menuBtn: { padding: 4 },
});
