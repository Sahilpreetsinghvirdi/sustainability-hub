import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';

export default function AvatarScreen() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [uri, setUri] = useState<string | null>((user as any)?.avatar || null);

  const pick = async (useCamera: boolean) => {
    const perm = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required'); return; }
    const res = useCamera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) { setUri(res.assets[0].uri); updateUser({ avatar: res.assets[0].uri } as any); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.headRow}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={18} color="#0A0A0A" /></Pressable><View style={{ width: 32 }} /></View>
      <View style={s.kickerRow}><Ionicons name="person-outline" size={12} color="#0A0A0A" /><Text style={s.kicker}>AVATAR MANAGEMENT</Text></View>
      <Text style={s.title}>IDENTITY VERIFICATION</Text>
      <Text style={s.sub}>Update your organizational profile image. High-contrast images improve facial recognition accuracy in environmental audits.</Text>

      <View style={s.photoCard}>
        <View style={s.circleWrap}>
          {uri ? <Image source={{ uri }} style={s.circleImg} /> : <View style={s.circlePlaceholder} />}
          <View style={s.noPhotoPill}><Text style={s.noPhotoText}>{uri ? 'PHOTO SET' : 'NO PHOTO SET'}</Text></View>
        </View>
        <Text style={s.name}>{user?.name || 'Alex Rivers'}</Text>
        <Text style={s.userId}>USER-ID: SH-88219</Text>
        <Pressable style={s.captureBtn} onPress={() => pick(true)}><Ionicons name="camera-outline" size={18} color="#fff" /><Text style={s.captureText}>CAPTURE IDENTITY</Text></Pressable>
        <View style={s.row}>
          <Pressable style={s.pill} onPress={() => pick(false)}><Ionicons name="arrow-up-outline" size={14} color="#0A0A0A" /><Text style={s.pillText}>UPLOAD</Text></Pressable>
          <Pressable style={s.pill} onPress={() => { setUri(null); updateUser({ avatar: undefined } as any); }}><Ionicons name="trash-outline" size={14} color="#0A0A0A" /><Text style={s.pillText}>REMOVE</Text></Pressable>
        </View>
      </View>

      <View style={s.compliance}><View style={s.complianceHead}><Ionicons name="information-circle-outline" size={14} color="#0A0A0A" /><Text style={s.complianceKicker}>COMPLIANCE STATUS</Text></View><Text style={s.complianceText}>ISO 14001:2015 compliant identity verification. Metadata is stripped for privacy protection.</Text></View>

      <Text style={s.techTitle}>TECHNICAL GUIDELINES</Text>
      <View style={s.guideCard}><View style={s.guideIcon}><Ionicons name="image-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.guideTitle}>Format & Scale</Text><Text style={s.guideSub}>Minimum 400x400px, JPG or PNG. Strictly monochrome preferred.</Text></View></View>
      <View style={s.guideCard}><View style={s.guideIcon}><Ionicons name="shield-checkmark-outline" size={16} color="#0A0A0A" /></View><View style={{ flex: 1 }}><Text style={s.guideTitle}>Lighting Precision</Text><Text style={s.guideSub}>Ensure high-contrast frontal lighting for biometric audit logs.</Text></View></View>

      <Pressable style={s.cancel} onPress={() => router.back()}><Ionicons name="close" size={16} color="#0A0A0A" /><Text style={s.cancelText}>Cancel Modification</Text></Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  kickerRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  kicker: { fontSize: 11, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.6 },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.3 },
  sub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: -8 },
  photoCard: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10, backgroundColor: '#F9FAFA' },
  circleWrap: { alignItems: 'center' },
  circlePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#E5E5E5' },
  circleImg: { width: 120, height: 120, borderRadius: 60 },
  noPhotoPill: { marginTop: -10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  noPhotoText: { fontSize: 10, fontWeight: '700', color: '#0A0A0A' },
  name: { fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginTop: 4 },
  userId: { fontSize: 10, color: '#6B7280', letterSpacing: 0.6 },
  captureBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 },
  captureText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  pill: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  pillText: { fontSize: 11, fontWeight: '700', color: '#0A0A0A' },
  compliance: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, gap: 6, backgroundColor: '#FAFAFA' },
  complianceHead: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  complianceKicker: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  complianceText: { fontSize: 11, lineHeight: 16, color: '#6B7280', fontStyle: 'italic' },
  techTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A', letterSpacing: 0.5, marginTop: 4 },
  guideCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFA' },
  guideIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontSize: 12, fontWeight: '800', color: '#0A0A0A' },
  guideSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  cancel: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  cancelText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
});
