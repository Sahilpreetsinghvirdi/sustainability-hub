// mobile/src/screens/CarbonManualScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Badge, Input, ProgressBar } from '@/ui';
import { useCarbon } from '@/hooks/useCarbon';
import { formatCarbon, formatCurrency, getCategoryColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const CATEGORIES = [
  { value: 'meat_beef', label: 'Meat - Beef', color: '#262626' },
  { value: 'meat_pork', label: 'Meat - Pork', color: '#444444' },
  { value: 'meat_poultry', label: 'Meat - Poultry', color: '#444444' },
  { value: 'meat_lamb', label: 'Meat - Lamb', color: '#262626' },
  { value: 'seafood', label: 'Seafood', color: '#6B6B6B' },
  { value: 'dairy_milk', label: 'Dairy - Milk', color: '#6B6B6B' },
  { value: 'dairy_cheese', label: 'Dairy - Cheese', color: '#6B6B6B' },
  { value: 'eggs', label: 'Eggs', color: '#9A9A9A' },
  { value: 'produce_fruit', label: 'Produce - Fruit', color: '#1C1C1C' },
  { value: 'produce_vegetable', label: 'Produce - Vegetable', color: '#1C1C1C' },
  { value: 'grains_bread', label: 'Grains - Bread', color: '#6B6B6B' },
  { value: 'grains_pasta', label: 'Grains - Pasta', color: '#444444' },
  { value: 'grains_rice', label: 'Grains - Rice', color: '#262626' },
  { value: 'beverages_alcoholic', label: 'Beverages - Alcoholic', color: '#6B6B6B' },
  { value: 'beverages_nonalcoholic', label: 'Beverages - Non-Alcoholic', color: '#6B6B6B' },
  { value: 'transport_fuel', label: 'Transport - Fuel', color: '#6B6B6B' },
  { value: 'other', label: 'Other', color: '#6B6B6B' },
];

const UNITS = ['kg', 'g', 'lb', 'oz', 'liter', 'ml', 'item', 'pack'];

export const CarbonManualScreen: React.FC = () => {
  const { createManualReceipt } = useCarbon();
  const [storeName, setStoreName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState<Array<{
    id: string;
    name: string;
    quantity: string;
    unit: string;
    price: string;
    category: string;
  }>>([{ id: '1', name: '', quantity: '', unit: 'item', price: '', category: 'other' }]);
  const [submitting, setSubmitting] = useState(false);

  const totalCarbon = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cat = CATEGORIES.find(c => c.value === item.category);
    const factor = cat ? getCategoryFactor(cat.value) : 1.0;
    return sum + (qty * factor);
  }, 0);

  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const getCategoryFactor = (category: string) => {
    const factors: Record<string, number> = {
      meat_beef: 27.0, meat_pork: 12.1, meat_poultry: 6.9, meat_lamb: 39.2,
      seafood: 5.4, dairy_milk: 1.9, dairy_cheese: 13.5, eggs: 4.8,
      produce_fruit: 0.4, produce_vegetable: 0.3, grains_bread: 1.1,
      grains_pasta: 1.4, grains_rice: 2.7, beverages_alcoholic: 2.3,
      beverages_nonalcoholic: 0.8, transport_fuel: 2.31,
    };
    return factors[category] || 1.0;
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: '', unit: 'item', price: '', category: 'other' }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter a store name');
      return;
    }
    if (items.some(i => !i.name.trim())) {
      Alert.alert('Error', 'All items must have a name');
      return;
    }

    setSubmitting(true);
    try {
      await createManualReceipt({
        store_name: storeName,
        total_amount: parseFloat(totalAmount) || totalPrice,
        currency,
        items: items.map(item => ({
          name: item.name,
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit,
          price: parseFloat(item.price) || 0,
          category: item.category,
        })),
      });
      router.push('/carbon');
    } catch (error) {
      Alert.alert('Error', 'Failed to save receipt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#0A0A0A">Manual Entry</Text>
        <Stack width={40} />
      </Stack>

      {/* Store Info */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#0A0A0A" marginBottom="lg">Store Information</Text>
        <Stack gap="4">
          <Input
            label="Store Name"
            placeholder="e.g., Whole Foods Market"
            value={storeName}
            onChangeText={setStoreName}
            leftIcon={<Ionicons name="storefront" size={20} color="#444444" />}
          />
          <Stack flexDirection="row" gap="3">
            <Input
              label="Total Amount"
              placeholder="0.00"
              value={totalAmount}
              onChangeText={setTotalAmount}
              type="decimal"
              leftIcon={<Ionicons name="cash" size={20} color="#444444" />}
              style={{ flex: 1 }}
            />
            <Input
              label="Currency"
              value={currency}
              onChangeText={setCurrency}
              leftIcon={<Ionicons name="currency-dollar" size={20} color="#444444" />}
              style={{ width: 100 }}
            />
          </Stack>
        </Stack>
      </Card>

      {/* Items */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
          <Text fontSize="16" fontWeight="600" color="#0A0A0A">Items</Text>
          <Button variant="ghost" size="sm" onPress={addItem}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="add" size={16} />
              <Text>Add Item</Text>
            </Stack>
          </Button>
        </Stack>

        <Stack gap="3">
          {items.map((item, index) => (
            <ItemForm
              key={item.id}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={() => removeItem(item.id)}
              canRemove={items.length > 1}
            />
          ))}
        </Stack>
      </Card>

      {/* Summary */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.summaryCard}>
        <Text fontSize="16" fontWeight="600" color="#0A0A0A" marginBottom="lg">Summary</Text>
        <Stack gap="3">
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="12" color="#444444">Items</Text>
            <Text fontSize="12" fontWeight="600" color="#0A0A0A">{items.length}</Text>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="12" color="#444444">Est. Carbon</Text>
            <Text fontSize="12" fontWeight="600" color="#1C1C1C">{formatCarbon(totalCarbon)}</Text>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="12" color="#444444">Total Price</Text>
            <Text fontSize="12" fontWeight="600" color="#0A0A0A">{formatCurrency(totalPrice)}</Text>
          </Stack>
        </Stack>
        <ProgressBar
          progress={Math.min(100, (totalCarbon / 200) * 100)}
          variant={totalCarbon > 180 ? 'danger' : totalCarbon > 140 ? 'warning' : 'success'}
          size="md"
          showLabel
          label="Monthly budget: 200 kg COâ‚‚e"
        />
      </Card>

      {/* Submit */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth loading={submitting} onPress={handleSubmit}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="save" size={20} />
            <Text>Save Receipt</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>Cancel</Button>
      </Stack>
    </ScrollView>
  );
};

const ItemForm = ({ item, index, onUpdate, onRemove, canRemove }: any) => (
  <Card variant="default" padding="md" style={styles.itemForm}>
    <Stack flexDirection="row" alignItems="flex-start" gap="3">
      <Text fontSize="24" fontWeight="700" color="#444444" style={{ marginTop: 8, width: 28 }}>{index + 1}.</Text>
      <Stack flex={1} gap="3">
        <Stack flexDirection="row" gap="2">
          <Input
            label="Item Name"
            placeholder="e.g., Organic Chicken Breast"
            value={item.name}
            onChangeText={v => onUpdate(item.id, 'name', v)}
            style={{ flex: 1 }}
          />
          <Input
            label="Qty"
            value={item.quantity}
            onChangeText={v => onUpdate(item.id, 'quantity', v)}
            type="decimal"
            placeholder="1.0"
            style={{ width: 80 }}
          />
          <Input
            label="Unit"
            value={item.unit}
            onChangeText={v => onUpdate(item.id, 'unit', v)}
            placeholder="kg"
            style={{ width: 80 }}
          />
        </Stack>
        <Stack flexDirection="row" gap="2">
          <Input
            label="Price"
            value={item.price}
            onChangeText={v => onUpdate(item.id, 'price', v)}
            type="decimal"
            placeholder="0.00"
            style={{ width: 100 }}
          />
          <Stack style={{ flex: 1 }}>
            <Text fontSize="8" color="#444444" marginBottom="1">Category</Text>
            <CategorySelector value={item.category} onChange={v => onUpdate(item.id, 'category', v)} />
          </Stack>
        </Stack>
        {canRemove && (
          <Button variant="ghost" size="xs" onPress={onRemove} style={{ marginTop: 8 }}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="trash" size={14} color="#444444" />
              <Text style={{ color: '#444444' }}>Remove</Text>
            </Stack>
          </Button>
        )}
      </Stack>
    </Stack>
  </Card>
);

const CategorySelector = ({ value, onChange }: any) => (
  <Button variant="outline" fullWidth style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
    <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
      <Stack flexDirection="row" alignItems="center" gap="2">
        <Stack width={12} height={12} borderRadius="sm" backgroundColor={CATEGORIES.find(c => c.value === value)?.color || '#DADADA'} />
        <Text fontSize="12" color="#0A0A0A">{CATEGORIES.find(c => c.value === value)?.label || 'Select Category'}</Text>
      </Stack>
      <Ionicons name="chevron-down" size={20} color="#444444" />
    </Stack>
  </Button>
);

const styles = {
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 24 },
  summaryCard: { backgroundColor: 'rgba(10,10,10,0.05)' },
  itemForm: {},
  actions: { marginTop: 8 },
};
