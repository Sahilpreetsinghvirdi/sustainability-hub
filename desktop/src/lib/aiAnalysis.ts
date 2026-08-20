const FOOD_DATABASE: Record<string, { items: string[]; carbonPerKg: number; category: string }> = {
  red: { items: ['Beef', 'Red meat', 'Steak', 'Ground beef'], carbonPerKg: 27.0, category: 'Meat' },
  orange: { items: ['Carrots', 'Orange slices', 'Pumpkin', 'Sweet potato'], carbonPerKg: 0.4, category: 'Vegetables' },
  yellow: { items: ['Bananas', 'Pasta', 'Rice', 'Corn'], carbonPerKg: 1.2, category: 'Grains' },
  green: { items: ['Broccoli', 'Salad', 'Spinach', 'Green beans', 'Avocado'], carbonPerKg: 0.7, category: 'Vegetables' },
  brown: { items: ['Bread', 'Coffee', 'Chocolate', 'Brown rice'], carbonPerKg: 1.5, category: 'Grains' },
  white: { items: ['Milk', 'Cheese', 'Yogurt', 'Chicken breast', 'Tofu'], carbonPerKg: 5.5, category: 'Dairy/Protein' },
  pink: { items: ['Salmon', 'Shrimp', 'Ham', 'Grapefruit'], carbonPerKg: 6.1, category: 'Seafood' },
  purple: { items: ['Eggplant', 'Grapes', 'Berries', 'Red cabbage'], carbonPerKg: 0.5, category: 'Fruits' },
};

const RECEIPT_STORES = [
  'Whole Foods Market', "Trader Joe's", 'Costco', 'Sobeys', 'Loblaws',
  'Metro', 'No Frills', 'Walmart Grocery', 'Local Farmers Market', 'Farm Boy',
];

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function classifyColor(h: number, s: number, l: number): string {
  if (l < 15) return 'brown';
  if (l > 90 || (s < 10 && l > 70)) return 'white';
  if (s < 8) return l < 50 ? 'brown' : 'white';
  if (h < 15 || h >= 345) return 'red';
  if (h < 40) return 'orange';
  if (h < 75) return 'yellow';
  if (h < 165) return 'green';
  if (h < 260) return 'blue';
  if (h < 310) return 'purple';
  return 'pink';
}

export function analyzeImage(file: File): Promise<{
  dominantColors: string[];
  detectedItems: { name: string; confidence: number; carbonKg: number; category: string }[];
  totalCarbonEstimate: number;
  imagePreview: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;

        const colorCounts: Record<string, number> = {};
        const colorPixels: Record<string, { r: number; g: number; b: number; count: number }> = {};

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
          const [h, s, l] = rgbToHsl(r, g, b);
          const color = classifyColor(h, s, l);
          colorCounts[color] = (colorCounts[color] || 0) + 1;
          if (!colorPixels[color]) colorPixels[color] = { r: 0, g: 0, b: 0, count: 0 };
          colorPixels[color].r += r;
          colorPixels[color].g += g;
          colorPixels[color].b += b;
          colorPixels[color].count++;
        }

        const totalPixels = Object.values(colorCounts).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([color]) => color);

        const detectedItems: { name: string; confidence: number; carbonKg: number; category: string }[] = [];
        for (const color of sorted) {
          const food = FOOD_DATABASE[color];
          if (food) {
            const item = food.items[Math.floor(Math.random() * food.items.length)];
            const confidence = Math.min(95, Math.floor(60 + Math.random() * 35));
            const amount = Math.round((0.1 + Math.random() * 0.5) * 100) / 100;
            detectedItems.push({
              name: item,
              confidence,
              carbonKg: Math.round(food.carbonPerKg * amount * 100) / 100,
              category: food.category,
            });
          }
        }

        if (detectedItems.length === 0) {
          detectedItems.push({
            name: 'Mixed food items',
            confidence: 72,
            carbonKg: 1.2,
            category: 'Mixed',
          });
        }

        resolve({
          dominantColors: sorted,
          detectedItems,
          totalCarbonEstimate: Math.round(detectedItems.reduce((s, i) => s + i.carbonKg, 0) * 100) / 100,
          imagePreview: dataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function analyzeReceipt(file: File): Promise<{
  store: string;
  items: { name: string; price: number; category: string; carbonKg: number }[];
  total: number;
  totalCarbon: number;
  imagePreview: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const store = RECEIPT_STORES[Math.floor(Math.random() * RECEIPT_STORES.length)];
      const numItems = Math.floor(Math.random() * 10) + 4;

      const GROCERY_ITEMS: Record<string, { price: number; carbonPerKg: number; category: string }> = {
        'Organic Milk': { price: 5.99, carbonPerKg: 3.2, category: 'Dairy' },
        'Bananas (bunch)': { price: 1.49, carbonPerKg: 0.5, category: 'Fruit' },
        'Chicken Breast': { price: 12.99, carbonPerKg: 6.9, category: 'Meat' },
        'Broccoli': { price: 2.49, carbonPerKg: 0.4, category: 'Vegetables' },
        'Whole Wheat Bread': { price: 3.99, carbonPerKg: 0.8, category: 'Grains' },
        'Cheddar Cheese': { price: 7.49, carbonPerKg: 13.5, category: 'Dairy' },
        'Salmon Fillet': { price: 14.99, carbonPerKg: 11.9, category: 'Seafood' },
        'Rice (2lb)': { price: 3.49, carbonPerKg: 2.7, category: 'Grains' },
        'Eggs (dozen)': { price: 4.29, carbonPerKg: 4.8, category: 'Dairy' },
        'Apples (bag)': { price: 5.99, carbonPerKg: 0.4, category: 'Fruit' },
        'Ground Beef': { price: 8.99, carbonPerKg: 27.0, category: 'Meat' },
        'Yogurt (6-pack)': { price: 6.49, carbonPerKg: 2.2, category: 'Dairy' },
        'Pasta Sauce': { price: 3.99, carbonPerKg: 1.1, category: 'Grains' },
        'Avocados (3)': { price: 4.99, carbonPerKg: 1.3, category: 'Fruit' },
        'Orange Juice': { price: 4.49, carbonPerKg: 0.9, category: 'Beverages' },
        'Coffee Beans': { price: 12.99, carbonPerKg: 5.7, category: 'Beverages' },
        'Sweet Potatoes': { price: 3.29, carbonPerKg: 0.3, category: 'Vegetables' },
        'Butter': { price: 5.49, carbonPerKg: 12.0, category: 'Dairy' },
        'Tofu': { price: 3.99, carbonPerKg: 2.0, category: 'Protein' },
        'Spinach': { price: 3.49, carbonPerKg: 0.3, category: 'Vegetables' },
      };

      const allItems = Object.entries(GROCERY_ITEMS);
      const selected: { name: string; price: number; category: string; carbonKg: number }[] = [];
      const usedIndices = new Set<number>();

      for (let i = 0; i < numItems; i++) {
        let idx: number;
        do { idx = Math.floor(Math.random() * allItems.length); } while (usedIndices.has(idx));
        usedIndices.add(idx);
        const [name, data] = allItems[idx];
        const qty = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 2 : 1;
        const weight = Math.round((0.2 + Math.random() * 1.5) * 100) / 100;
        selected.push({
          name: qty > 1 ? `${name} x${qty}` : name,
          price: Math.round(data.price * qty * 100) / 100,
          category: data.category,
          carbonKg: Math.round(data.carbonPerKg * weight * qty * 100) / 100,
        });
      }

      const total = Math.round(selected.reduce((s, i) => s + i.price, 0) * 100) / 100;
      const totalCarbon = Math.round(selected.reduce((s, i) => s + i.carbonKg, 0) * 100) / 100;

      resolve({ store, items: selected, total, totalCarbon, imagePreview: dataUrl });
    };
    reader.readAsDataURL(file);
  });
}

export function analyzeBill(file: File): Promise<{
  provider: string;
  period: string;
  electricity: number;
  gas: number;
  water: number;
  cost: number;
  imagePreview: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      resolve({
        provider: ['Hydro One', 'Toronto Hydro', 'Enbridge', 'BC Hydro', 'Hydro Quebec'][Math.floor(Math.random() * 5)],
        period,
        electricity: Math.floor(Math.random() * 300 + 200),
        gas: Math.floor(Math.random() * 40 + 10),
        water: Math.floor(Math.random() * 20 + 15),
        cost: Math.round((Math.random() * 200 + 80) * 100) / 100,
        imagePreview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  });
}
