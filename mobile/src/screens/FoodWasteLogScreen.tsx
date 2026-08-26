import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFoodWasteStore } from '@/store/foodWasteStore';
import { useAuthStore } from '@/store/authStore';

export const FoodWasteLogScreen: React.FC = () => {
  const addLog = useFoodWasteStore(s => s.addLog);
  const user = useAuthStore(s => s.user);
  const [meal, setMeal] = useState<'breakfast'|'lunch'|'dinner'|'snack'>('dinner');
  const [kg, setKg] = useState('0.5');
  const [cost, setCost] = useState('2.5');
  const [saving, setSaving] = useState(false);
  const onSave = () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const avoid = parseFloat(kg) || 0;
      const c = parseFloat(cost) || 0;
      const log: any = {
        id: `fw_${Date.now()}`, user_id: user?.id || 'local', household_id: user?.household_id || 'local',
        meal_type: meal, meal_image_uri: '', waste_image_uri: '',
        plate_analysis: { total_food_kg: avoid, food_items: [], plate_area_cm2: 0, confidence: 1 },
        waste_analysis: { total_waste_kg: avoid, waste_items: [], waste_area_cm2: 0, confidence: 1 },
        avoidable_waste_kg: avoid, unavoidable_waste_kg: 0, cost_usd: c, carbon_kg: avoid * 2.5, logged_at: now,
      };
      addLog(log);
      Alert.alert('Saved', 'Waste entry added', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e:any){ Alert.alert('Error', e.message)} finally { setSaving(false)}
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.head}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={20} color="#0A0A0A" /></Pressable><Text style={s.headTitle}>Log Waste</Text><View style={{ width: 32 }} /></View>
      <View style={s.card}>
        <Text style={s.label}>Meal Type</Text>
        <View style={s.chips}>{(['breakfast','lunch','dinner','snack'] as const).map(m => (
          <Pressable key={m} onPress={() => setMeal(m)} style={[s.chip, meal===m && s.chipActive]}><Text style={[s.chipText, meal===m && s.chipTextActive]}>{m}</Text></Pressable>
        ))}</View>
        <Text style={s.label}>Avoidable Waste (kg)</Text>
        <View style={s.inputWrap}><Ionicons name="trash-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="0.5" keyboardType="decimal-pad" value={kg} onChangeText={setKg} /><Text style={s.unit}>kg</Text></View>
        <Text style={s.label}>Cost (USD)</Text>
        <View style={s.inputWrap}><Ionicons name="cash-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="2.50" keyboardType="decimal-pad" value={cost} onChangeText={setCost} /></View>
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
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  chipTextActive: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
});
