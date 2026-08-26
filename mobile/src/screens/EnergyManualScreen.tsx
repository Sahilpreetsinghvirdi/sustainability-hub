import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEnergyStore } from '@/store/energyStore';
import { useAuthStore } from '@/store/authStore';

export const EnergyManualScreen: React.FC = () => {
  const addBill = useEnergyStore(s => s.addBill);
  const user = useAuthStore(s => s.user);
  const [provider, setProvider] = useState('');
  const [kwh, setKwh] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);
  const onSave = () => {
    if (!kwh) { Alert.alert('kWh required'); return; }
    setSaving(true);
    try {
      const now = new Date(); const start = new Date(now); start.setDate(1);
      const bill: any = {
        id: `bill_${Date.now()}`, user_id: user?.id || 'local', household_id: user?.household_id || 'local',
        billing_period_start: start.toISOString(), billing_period_end: now.toISOString(),
        electricity_kwh: parseFloat(kwh) || 0, gas_therms: 0, water_gallons: 0,
        total_cost: parseFloat(cost) || 0, currency: 'USD', utility_provider: provider || 'Manual', bill_image_uri: undefined, parsed_data: { raw_text: 'manual', confidence: 1 }, created_at: now.toISOString(),
      };
      addBill(bill);
      Alert.alert('Saved', 'Energy entry added', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e:any){ Alert.alert('Error', e.message)} finally { setSaving(false)}
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.head}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={20} color="#0A0A0A" /></Pressable><Text style={s.headTitle}>Log Energy</Text><View style={{ width: 32 }} /></View>
      <View style={s.card}>
        <Text style={s.label}>Utility Provider</Text>
        <View style={s.inputWrap}><Ionicons name="business-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="e.g., PG&E" placeholderTextColor="#9CA3AF" value={provider} onChangeText={setProvider} /></View>
        <Text style={s.label}>Electricity (kWh) *</Text>
        <View style={s.inputWrap}><Ionicons name="flash-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="48.2" keyboardType="decimal-pad" value={kwh} onChangeText={setKwh} /><Text style={s.unit}>kWh</Text></View>
        <Text style={s.label}>Total Cost (USD)</Text>
        <View style={s.inputWrap}><Ionicons name="cash-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="2.84" keyboardType="decimal-pad" value={cost} onChangeText={setCost} /></View>
      </View>
      <Pressable style={[s.saveBtn, saving && {opacity:0.6}]} onPress={onSave} disabled={saving}><Ionicons name="save-outline" size={18} color="#fff" /><Text style={s.saveText}>{saving?'Saving...':'Save Entry'}</Text></Pressable>
      <Pressable style={s.cancel} onPress={() => router.back()}><Text style={s.cancelText}>Cancel</Text></Pressable>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  headTitle: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  card: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, gap: 10, backgroundColor: '#F9FAFA' },
  label: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 12, backgroundColor: '#FFFFFF', height: 42 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  unit: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  saveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
});
