import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCarbonStore } from '@/store/carbonStore';
import { useAuthStore } from '@/store/authStore';

export const CarbonManualScreen: React.FC = () => {
  const addScan = useCarbonStore(s => s.addScan);
  const user = useAuthStore(s => s.user);
  const [storeName, setStoreName] = useState('');
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('other');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!storeName.trim()) { Alert.alert('Store required'); return; }
    if (!itemName.trim()) { Alert.alert('Item name required'); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const q = parseFloat(qty) || 1;
      const p = parseFloat(price) || parseFloat(amount) || 0;
      const factorMap: any = { meat_beef:27, meat_pork:12.1, meat_poultry:6.9, seafood:5.4, dairy_milk:1.9, produce_fruit:0.4, produce_vegetable:0.3, grains_rice:2.7, transport_fuel:2.31, other:1 };
      const carbon = q * (factorMap[category] || 1);
      const scan: any = {
        id: `scan_${Date.now()}`,
        user_id: user?.id || 'local',
        household_id: user?.household_id || 'local',
        image_uri: '',
        ocr_text: '',
        items: [{ id: `it_${Date.now()}`, name: itemName, quantity: q, unit: 'item', price: p, category, carbon_kg: carbon, carbon_source: 'manual', confidence: 1 }],
        total_carbon_kg: carbon,
        currency: 'USD',
        total_amount: p,
        store_name: storeName,
        scanned_at: now,
        processed_at: now,
        status: 'completed',
      };
      addScan(scan);
      Alert.alert('Saved', 'Carbon entry added', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setSaving(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.head}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={20} color="#0A0A0A" /></Pressable><Text style={s.headTitle}>Log Consumption</Text><View style={{ width: 32 }} /></View>

      <View style={s.card}>
        <Text style={s.label}>Store / Source</Text>
        <View style={s.inputWrap}><Ionicons name="storefront-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="e.g., Whole Foods" placeholderTextColor="#9CA3AF" value={storeName} onChangeText={setStoreName} /></View>
        <Text style={s.label}>Total Amount (optional)</Text>
        <View style={s.inputWrap}><Ionicons name="cash-outline" size={16} color="#6B7280" /><TextInput style={s.input} placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /></View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Item</Text>
        <Text style={s.label}>Item Name *</Text>
        <View style={s.inputWrap}><TextInput style={s.input} placeholder="e.g., Organic Chicken" placeholderTextColor="#9CA3AF" value={itemName} onChangeText={setItemName} /></View>
        <View style={s.row}>
          <View style={{ flex: 1 }}><Text style={s.label}>Qty</Text><View style={s.inputWrap}><TextInput style={s.input} placeholder="1" keyboardType="decimal-pad" value={qty} onChangeText={setQty} /></View></View>
          <View style={{ flex: 1 }}><Text style={s.label}>Price</Text><View style={s.inputWrap}><TextInput style={s.input} placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} /></View></View>
        </View>
        <Text style={s.label}>Category</Text>
        <View style={s.chips}>{['produce_vegetable','produce_fruit','meat_beef','grains_rice','other'].map(c => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category===c && s.chipActive]}><Text style={[s.chipText, category===c && s.chipTextActive]}>{c.replace('_',' ')}</Text></Pressable>
        ))}</View>
      </View>

      <Pressable style={[s.saveBtn, saving && { opacity:0.6 }]} onPress={onSave} disabled={saving}><Ionicons name="save-outline" size={18} color="#fff" /><Text style={s.saveText}>{saving?'Saving...':'Save Entry'}</Text></Pressable>
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
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#0A0A0A' },
  label: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 0.6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 9999, paddingHorizontal: 12, backgroundColor: '#FFFFFF', height: 42 },
  input: { flex: 1, fontSize: 13, color: '#0A0A0A', paddingVertical: 0 },
  row: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  chipTextActive: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
});
