// mobile/src/screens/CarbonReviewScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Badge, ProgressBar, Input } from '@/ui';
import { useCarbon } from '@/hooks/useCarbon';
import { formatCarbon, formatCurrency, formatDate, getCategoryColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const CarbonReviewScreen: React.FC = () => {
  const { currentScan, updateItem } = useCarbon();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const scan = currentScan;

  if (!scan) return <LoadingScreen />;

  const totalItems = scan.items?.length || 0;
  const completedItems = scan.items?.filter(i => i.carbon_kg > 0).length || 0;

  const handleSave = async () => {
    if (editingItemId && editQuantity) {
      await updateItem(editingItemId, { quantity: parseFloat(editQuantity) });
      setEditingItemId(null);
      setEditQuantity('');
    }
    router.push('/carbon');
  };

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity.toString());
    setEditCategory(item.category);
  };

  const handleCategoryChange = (item: any, newCategory: string) => {
    updateItem(item.id, { category: newCategory, carbon_kg: getCategoryCarbon(newCategory, item.quantity) });
  };

  const getCategoryCarbon = (category: string, quantity: number) => {
    const factors: Record<string, number> = {
      meat_beef: 27.0, meat_pork: 12.1, meat_poultry: 6.9, meat_lamb: 39.2,
      seafood: 5.4, dairy_milk: 1.9, dairy_cheese: 13.5, eggs: 4.8,
      produce_fruit: 0.4, produce_vegetable: 0.3, grains_bread: 1.1,
      grains_pasta: 1.4, grains_rice: 2.7, beverages_alcoholic: 2.3,
      beverages_nonalcoholic: 0.8, transport_fuel: 2.31,
    };
    return (factors[category] || 1.0) * quantity;
  };

  if (!scan) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="$5" fontWeight="700" color="$color">Review Receipt</Text>
        <Stack width={40} />
      </Stack>

      {/* Store Info */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" gap="4">
          <Stack width={56} height={56} borderRadius="lg" backgroundColor="$primary20" alignItems="center" justifyContent="center">
            <Ionicons name="storefront" size={28} color="$primary" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$5" fontWeight="700" color="$color">{scan.store_name || 'Unknown Store'}</Text>
            <Text fontSize="$2" color="$colorFocus">{formatDate(scan.scanned_at)}</Text>
          </Stack>
          <Stack alignItems="flex-end">
            <Text fontSize="$6" fontWeight="800" color="$primary">{formatCarbon(scan.total_carbon_kg)}</Text>
            <Text fontSize="$2" color="$colorFocus">{formatCurrency(scan.total_amount)}</Text>
          </Stack>
        </Stack>
      </Card>

      {/* Progress */}
      <Card variant="default" padding="md" marginBottom="lg">
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="3">
          <Text fontSize="$3" fontWeight="600" color="$color">Processing Progress</Text>
          <Badge variant="success" size="sm">{completedItems}/{totalItems} items matched</Badge>
        </Stack>
        <ProgressBar
          progress={totalItems > 0 ? (completedItems / totalItems) * 100 : 0}
          variant="success"
          size="md"
          showLabel
          label="Items with carbon data"
        />
      </Card>

      {/* Items List */}
      <Stack marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
          <Text fontSize="$5" fontWeight="700" color="$color">Items ({totalItems})</Text>
          <Button variant="ghost" size="sm" onPress={() => router.push('/carbon/manual')}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="add" size={16} />
              <Text>Add Item</Text>
            </Stack>
          </Button>
        </Stack>

        <Stack gap="2">
          {scan.items?.map((item: any, index: number) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              isEditing={editingItemId === item.id}
              onEdit={handleEditItem}
              onSave={() => { setEditingItemId(null); setEditQuantity(''); }}
              onCategoryChange={handleCategoryChange}
              editQuantity={editQuantity}
              setEditQuantity={setEditQuantity}
            />
          ))}
        </Stack>
      </Stack>

      {/* Breakdown */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="lg">Carbon Breakdown</Text>
        <Stack gap="2">
          {Object.entries(scan.items?.reduce((acc: any, item: any) => {
            acc[item.category] = (acc[item.category] || 0) + item.carbon_kg;
            return acc;
          }, {}) || {}).map(([category, value]: any) => (
            <CategoryBreakdownRow key={category} category={category} value={value} total={scan.total_carbon_kg} />
          ))}
        </Stack>
      </Card>

      {/* Insights */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.insightCard}>
        <Stack flexDirection="row" alignItems="flex-start" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="$warning20" alignItems="center" justifyContent="center">
            <Ionicons name="lightbulb" size={22} color="$warning" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$color">Smart Insight</Text>
            <Text fontSize="$3" color="$colorFocus" marginTop="1">
              {getInsight(scan)}
            </Text>
          </Stack>
        </Stack>
        <Button variant="outline" fullWidth>Learn More</Button>
      </Card>

      {/* Actions */}
      <Stack gap="3" style={styles.actions}>
        <Button variant="primary" fullWidth onPress={handleSave}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="checkmark" size={20} />
            <Text>Save & Continue</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.push('/carbon')}>Back to Carbon</Button>
      </Stack>
    </ScrollView>
  );
};

const LoadingScreen = () => (
  <Stack style={styles.loading}>
    <Ionicons name="sync" size={48} color="$primary" />
    <Text fontSize="$3" color="$colorFocus" marginTop="3">Loading receipt...</Text>
  </Stack>
);

const totalItems = scan.items?.length || 0;
const completedItems = scan.items?.filter((i: any) => i.carbon_kg > 0).length || 0;

const handleEditItem = (item: any) => {
  setEditingItemId(item.id);
  setEditQuantity(item.quantity.toString());
  setEditCategory(item.category);
};

const handleCategoryChange = (item: any, newCategory: string) => {
  updateItem(item.id, { category: newCategory, carbon_kg: getCategoryCarbon(newCategory, item.quantity) });
};

const getCategoryCarbon = (category: string, quantity: number) => {
  const factors: Record<string, number> = {
    meat_beef: 27.0, meat_pork: 12.1, meat_poultry: 6.9, meat_lamb: 39.2,
    seafood: 5.4, dairy_milk: 1.9, dairy_cheese: 13.5, eggs: 4.8,
    produce_fruit: 0.4, produce_vegetable: 0.3, grains_bread: 1.1,
    grains_pasta: 1.4, grains_rice: 2.7, beverages_alcoholic: 2.3,
    beverages_nonalcoholic: 0.8, transport_fuel: 2.31,
  };
  return (factors[category] || 1.0) * quantity;
};

const getInsight = (scan: any) => {
  const topCategory = Object.entries(
    scan.items?.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + item.carbon_kg;
      return acc;
    }, {}) || {}
  ).sort(([, a], [, b]) => (b as number) - (a as number))[0];

  if (!topCategory) return 'Scan more receipts to get personalized insights.';

  const [category, carbon] = topCategory;
  const percentage = ((carbon as number) / scan.total_carbon_kg) * 100;

  if (category === 'meat_beef' && percentage > 50) {
    return `Beef makes up ${percentage.toFixed(0)}% of this receipt's carbon. Swapping for chicken could save ~${(carbon as number * 0.75).toFixed(1)} kg CO₂e.`;
  }
  if (category.startsWith('meat_') && percentage > 40) {
    return `Meat accounts for ${percentage.toFixed(0)}% of this receipt's footprint. Consider plant-based alternatives for future shops.`;
  }
  return `Your highest carbon category is ${category.replace(/_/g, ' ')} at ${percentage.toFixed(0)}%.`;
};

const ItemCard = ({ item, index, isEditing, onEdit, onSave, onCategoryChange, editQuantity, setEditQuantity }: any) => {
  const categoryColor = getCategoryColor(item.category);
  const categories = [
    'meat_beef', 'meat_pork', 'meat_poultry', 'meat_lamb', 'seafood',
    'dairy_milk', 'dairy_cheese', 'eggs', 'produce_fruit', 'produce_vegetable',
    'grains_bread', 'grains_pasta', 'grains_rice', 'beverages_alcoholic',
    'beverages_nonalcoholic', 'transport_fuel', 'other',
  ];

  return (
    <Card variant="default" padding="md" style={styles.itemCard}>
      <Stack flexDirection="row" alignItems="center" gap="3">
        <Text fontSize="$6" fontWeight="700" color="$colorFocus" style={{ width: 28 }}>{index + 1}.</Text>
        <Stack width={4} height="100%" borderRadius="full" backgroundColor={categoryColor} />
        <Stack flex={1} gap="1">
          <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text fontSize="$3" fontWeight="600" color="$color">{item.name}</Text>
            {isEditing ? (
              <Button variant="ghost" size="xs" onPress={onSave}>
                <Ionicons name="checkmark" size={16} />
              </Button>
            ) : (
              <Badge
                variant={item.confidence > 0.8 ? 'success' : item.confidence > 0.5 ? 'warning' : 'danger'}
                size="xs"
              >
                {Math.round(item.confidence * 100)}%
              </Badge>
            )}
          </Stack>
        </Stack>
        <Stack alignItems="flex-end" gap="1" style={{ minWidth: 80 }}>
          <Text fontSize="$4" fontWeight="700" color="$primary">{formatCarbon(item.carbon_kg)}</Text>
          <Text fontSize="$1" color="$colorFocus">{formatCurrency(item.price)}</Text>
        </Stack>
      </Stack>

      {isEditing ? (
        <Stack gap="3" marginTop="3" style={styles.editFields}>
          <Stack flexDirection="row" gap="3">
            <Input
              label="Quantity"
              value={editQuantity}
              onChangeText={setEditQuantity}
              type="decimal"
              placeholder="1.0"
              style={{ flex: 1 }}
            />
            <Input
              label="Category"
              value={editCategory || item.category}
              onChangeText={setEditQuantity}
              placeholder={item.category}
              style={{ flex: 1 }}
            />
          </Stack>
        </Stack>
      ) : (
        <Stack flexDirection="row" gap="2" marginTop="2" style={styles.itemActions}>
          <Button variant="ghost" size="xs" onPress={() => onEdit(item)}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="pencil" size={14} />
              <Text>Edit</Text>
            </Stack>
          </Button>
          <Button variant="ghost" size="xs" onPress={() => onCategoryChange(item, 'other')}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="swap-horizontal" size={14} />
              <Text>Recategorize</Text>
            </Stack>
          </Button>
        </Stack>
      )}
    </Card>
  );
};

const CategoryBreakdownRow = ({ category, value, total }: any) => (
  <Stack flexDirection="row" alignItems="center" gap="3" style={styles.breakdownRow}>
    <Stack width={12} height={12} borderRadius="sm" backgroundColor={getCategoryColor(category)} />
    <Stack flex={1}>
      <Text fontSize="$3" color="$color" fontWeight="500">
        {category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
      </Text>
      <ProgressBar
        progress={total > 0 ? (value / total) * 100 : 0}
        size="sm"
        variant="default"
      />
    </Stack>
    <Stack alignItems="flex-end" style={{ minWidth: 70 }}>
      <Text fontSize="$3" fontWeight="600" color="$color">{formatCarbon(value)}</Text>
      <Text fontSize="$1" color="$colorFocus">{total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'}</Text>
    </Stack>
  </Stack>
);

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 },
  itemCard: {},
  editFields: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '$border', marginTop: 8 },
  itemActions: { marginTop: 4 },
  breakdownRow: { paddingVertical: 4 },
  insightCard: { backgroundColor: '$warning05' },
  actions: { marginTop: 8 },
};