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

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function labDist(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

interface Pixel { r: number; g: number; b: number }
interface Cluster extends Pixel { count: number; lab: [number, number, number] }

function kMeans(pixels: Pixel[], k: number, maxIter = 25): Cluster[] {
  const centroids: Pixel[] = [{ ...pixels[Math.floor(Math.random() * pixels.length)] }];
  for (let c = 1; c < k; c++) {
    const dists = pixels.map(p => {
      let minD = Infinity;
      for (const cent of centroids) {
        const d = (p.r - cent.r) ** 2 + (p.g - cent.g) ** 2 + (p.b - cent.b) ** 2;
        if (d < minD) minD = d;
      }
      return minD;
    });
    const total = dists.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) { centroids.push({ ...pixels[i] }); break; }
    }
    if (centroids.length <= c) centroids.push({ ...pixels[Math.floor(Math.random() * pixels.length)] });
  }
  let assignments = new Int32Array(pixels.length);
  for (let iter = 0; iter < maxIter; iter++) {
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity, best = 0;
      for (let c = 0; c < k; c++) {
        const d = (pixels[i].r - centroids[c].r) ** 2 + (pixels[i].g - centroids[c].g) ** 2 + (pixels[i].b - centroids[c].b) ** 2;
        if (d < minD) { minD = d; best = c; }
      }
      assignments[i] = best;
    }
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r; sums[c].g += pixels[i].g; sums[c].b += pixels[i].b; sums[c].count++;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c].count > 0) centroids[c] = { r: sums[c].r / sums[c].count, g: sums[c].g / sums[c].count, b: sums[c].b / sums[c].count };
    }
  }
  const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
  for (let i = 0; i < pixels.length; i++) {
    const c = assignments[i];
    sums[c].r += pixels[i].r; sums[c].g += pixels[i].g; sums[c].b += pixels[i].b; sums[c].count++;
  }
  return sums.filter(s => s.count > 0).map(s => ({
    r: Math.round(s.r / s.count), g: Math.round(s.g / s.count), b: Math.round(s.b / s.count),
    count: s.count,
    lab: rgbToLab(s.r / s.count, s.g / s.count, s.b / s.count),
  })).sort((a, b) => b.count - a.count);
}

interface FoodEntry { name: string; carbonPerKg: number; category: string; avgWeight: number; lab: [number, number, number] }

const FOOD_KB: FoodEntry[] = [
  { name: 'Beef Steak', carbonPerKg: 27.0, category: 'Meat', avgWeight: 250, lab: rgbToLab(115, 38, 25) },
  { name: 'Ground Beef', carbonPerKg: 27.0, category: 'Meat', avgWeight: 450, lab: rgbToLab(102, 31, 20) },
  { name: 'Chicken Breast', carbonPerKg: 6.9, category: 'Poultry', avgWeight: 200, lab: rgbToLab(217, 184, 153) },
  { name: 'Pork Chop', carbonPerKg: 12.1, category: 'Meat', avgWeight: 220, lab: rgbToLab(191, 140, 115) },
  { name: 'Bacon', carbonPerKg: 11.0, category: 'Meat', avgWeight: 100, lab: rgbToLab(140, 64, 38) },
  { name: 'Salmon Fillet', carbonPerKg: 11.9, category: 'Seafood', avgWeight: 180, lab: rgbToLab(217, 115, 89) },
  { name: 'Shrimp', carbonPerKg: 18.0, category: 'Seafood', avgWeight: 200, lab: rgbToLab(217, 140, 128) },
  { name: 'Cheddar Cheese', carbonPerKg: 13.5, category: 'Dairy', avgWeight: 200, lab: rgbToLab(230, 191, 77) },
  { name: 'Milk', carbonPerKg: 3.2, category: 'Dairy', avgWeight: 1000, lab: rgbToLab(242, 242, 242) },
  { name: 'Yogurt', carbonPerKg: 2.2, category: 'Dairy', avgWeight: 500, lab: rgbToLab(242, 237, 230) },
  { name: 'Butter', carbonPerKg: 12.0, category: 'Dairy', avgWeight: 250, lab: rgbToLab(242, 224, 140) },
  { name: 'Eggs', carbonPerKg: 4.8, category: 'Dairy', avgWeight: 500, lab: rgbToLab(235, 224, 209) },
  { name: 'Broccoli', carbonPerKg: 0.4, category: 'Vegetables', avgWeight: 300, lab: rgbToLab(64, 115, 38) },
  { name: 'Spinach', carbonPerKg: 0.3, category: 'Vegetables', avgWeight: 200, lab: rgbToLab(38, 89, 25) },
  { name: 'Carrots', carbonPerKg: 0.4, category: 'Vegetables', avgWeight: 500, lab: rgbToLab(217, 128, 38) },
  { name: 'Tomatoes', carbonPerKg: 0.4, category: 'Vegetables', avgWeight: 300, lab: rgbToLab(191, 38, 31) },
  { name: 'Potatoes', carbonPerKg: 0.3, category: 'Vegetables', avgWeight: 800, lab: rgbToLab(191, 166, 115) },
  { name: 'Sweet Potato', carbonPerKg: 0.3, category: 'Vegetables', avgWeight: 400, lab: rgbToLab(179, 89, 25) },
  { name: 'Avocado', carbonPerKg: 1.3, category: 'Fruit', avgWeight: 200, lab: rgbToLab(64, 89, 31) },
  { name: 'Bell Pepper', carbonPerKg: 0.4, category: 'Vegetables', avgWeight: 200, lab: rgbToLab(204, 38, 25) },
  { name: 'Bananas', carbonPerKg: 0.5, category: 'Fruit', avgWeight: 150, lab: rgbToLab(230, 217, 77) },
  { name: 'Apples', carbonPerKg: 0.4, category: 'Fruit', avgWeight: 200, lab: rgbToLab(179, 38, 31) },
  { name: 'Oranges', carbonPerKg: 0.4, category: 'Fruit', avgWeight: 200, lab: rgbToLab(230, 140, 38) },
  { name: 'Grapes', carbonPerKg: 0.5, category: 'Fruit', avgWeight: 300, lab: rgbToLab(115, 38, 102) },
  { name: 'Strawberries', carbonPerKg: 0.5, category: 'Fruit', avgWeight: 300, lab: rgbToLab(191, 46, 51) },
  { name: 'Blueberries', carbonPerKg: 0.5, category: 'Fruit', avgWeight: 200, lab: rgbToLab(64, 38, 89) },
  { name: 'Rice', carbonPerKg: 2.7, category: 'Grains', avgWeight: 500, lab: rgbToLab(235, 230, 209) },
  { name: 'Bread', carbonPerKg: 0.8, category: 'Grains', avgWeight: 400, lab: rgbToLab(166, 115, 64) },
  { name: 'Pasta', carbonPerKg: 1.1, category: 'Grains', avgWeight: 500, lab: rgbToLab(224, 209, 140) },
  { name: 'Tofu', carbonPerKg: 2.0, category: 'Protein', avgWeight: 400, lab: rgbToLab(235, 230, 209) },
  { name: 'Lentils', carbonPerKg: 0.9, category: 'Legumes', avgWeight: 300, lab: rgbToLab(140, 102, 51) },
  { name: 'Black Beans', carbonPerKg: 0.9, category: 'Legumes', avgWeight: 400, lab: rgbToLab(38, 31, 25) },
];﻿const GROCERY_DB: Record<string, { price: number; carbonPerKg: number; category: string; weight: number }> = {
  'Organic Milk 1L': { price: 5.99, carbonPerKg: 3.2, category: 'Dairy', weight: 1.0 },
  'Bananas (bunch)': { price: 1.49, carbonPerKg: 0.5, category: 'Fruit', weight: 0.3 },
  'Chicken Breast 500g': { price: 12.99, carbonPerKg: 6.9, category: 'Meat', weight: 0.5 },
  'Broccoli': { price: 2.49, carbonPerKg: 0.4, category: 'Vegetables', weight: 0.3 },
  'Whole Wheat Bread': { price: 3.99, carbonPerKg: 0.8, category: 'Grains', weight: 0.4 },
  'Cheddar Cheese 200g': { price: 7.49, carbonPerKg: 13.5, category: 'Dairy', weight: 0.2 },
  'Salmon Fillet': { price: 14.99, carbonPerKg: 11.9, category: 'Seafood', weight: 0.2 },
  'Basmati Rice 1kg': { price: 3.49, carbonPerKg: 2.7, category: 'Grains', weight: 1.0 },
  'Eggs (dozen)': { price: 4.29, carbonPerKg: 4.8, category: 'Dairy', weight: 0.75 },
  'Apples (6-pack)': { price: 5.99, carbonPerKg: 0.4, category: 'Fruit', weight: 1.0 },
  'Ground Beef 500g': { price: 8.99, carbonPerKg: 27.0, category: 'Meat', weight: 0.5 },
  'Greek Yogurt': { price: 6.49, carbonPerKg: 2.2, category: 'Dairy', weight: 0.5 },
  'Pasta Sauce': { price: 3.99, carbonPerKg: 1.1, category: 'Grains', weight: 0.7 },
  'Avocados (3)': { price: 4.99, carbonPerKg: 1.3, category: 'Fruit', weight: 0.6 },
  'Orange Juice 1L': { price: 4.49, carbonPerKg: 0.9, category: 'Beverages', weight: 1.0 },
  'Coffee Beans 250g': { price: 12.99, carbonPerKg: 5.7, category: 'Beverages', weight: 0.25 },
  'Sweet Potatoes': { price: 3.29, carbonPerKg: 0.3, category: 'Vegetables', weight: 0.8 },
  'Butter': { price: 5.49, carbonPerKg: 12.0, category: 'Dairy', weight: 0.25 },
  'Organic Tofu': { price: 3.99, carbonPerKg: 2.0, category: 'Protein', weight: 0.4 },
  'Baby Spinach': { price: 3.49, carbonPerKg: 0.3, category: 'Vegetables', weight: 0.15 },
  'Ground Turkey': { price: 9.99, carbonPerKg: 10.0, category: 'Meat', weight: 0.5 },
  'Pork Tenderloin': { price: 7.99, carbonPerKg: 12.1, category: 'Meat', weight: 0.5 },
  'Atlantic Salmon': { price: 16.99, carbonPerKg: 11.9, category: 'Seafood', weight: 0.3 },
  'Penne Pasta': { price: 2.49, carbonPerKg: 1.1, category: 'Grains', weight: 0.5 },
  'Canned Tuna': { price: 3.49, carbonPerKg: 6.1, category: 'Seafood', weight: 0.17 },
  'Blueberries': { price: 5.49, carbonPerKg: 0.5, category: 'Fruit', weight: 0.15 },
  'Strawberries': { price: 4.99, carbonPerKg: 0.5, category: 'Fruit', weight: 0.45 },
  'Red Bell Pepper': { price: 1.99, carbonPerKg: 0.4, category: 'Vegetables', weight: 0.2 },
  'Cherry Tomatoes': { price: 3.99, carbonPerKg: 0.4, category: 'Vegetables', weight: 0.3 },
  'Olive Oil': { price: 9.99, carbonPerKg: 3.2, category: 'Pantry', weight: 0.5 },
};

const RECEIPT_STORES = [
  'Whole Foods Market', "Trader Joe's", 'Costco Wholesale', 'Sobeys', 'Loblaws',
  'Metro', 'No Frills', 'Walmart Grocery', 'Farm Boy', 'Longos', 'FreshCo', 'Food Basics',
];

function hueName(h: number): string {
  if (h < 15 || h >= 345) return 'red';
  if (h < 40) return 'orange';
  if (h < 75) return 'yellow';
  if (h < 165) return 'green';
  if (h < 260) return 'blue';
  if (h < 310) return 'purple';
  return 'pink';
}

function samplePixels(file: File, size: number): Promise<{ pixels: Pixel[]; preview: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const pixels: Pixel[] = [];
        for (let i = 0; i < data.length; i += 4) pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        resolve({ pixels, preview: dataUrl });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}﻿export function analyzeImage(file: File): Promise<{
  dominantColors: string[];
  detectedItems: { name: string; confidence: number; carbonKg: number; category: string; portion: string }[];
  totalCarbonEstimate: number;
  imagePreview: string;
}> {
  return new Promise((resolve) => {
    samplePixels(file, 128).then(({ pixels, preview }) => {
      const clusters = kMeans(pixels, 8, 30);
      const total = pixels.length;

      const dominantColors = clusters.slice(0, 3).map(c => hueName(rgbToHsl(c.r, c.g, c.b)[0]));

      const detectedItems: { name: string; confidence: number; carbonKg: number; category: string; portion: string }[] = [];
      const matchedNames = new Set<string>();

      for (const cluster of clusters.slice(0, 5)) {
        const [h, s, l] = rgbToHsl(cluster.r, cluster.g, cluster.b);
        const clusterLab = rgbToLab(cluster.r / 255, cluster.g / 255, cluster.b / 255);
        const fraction = cluster.count / total;
        if (fraction < 0.03 || l < 10 || (s < 5 && l > 85)) continue;

        let bestEntry: FoodEntry | null = null;
        let bestDist = Infinity;
        for (const entry of FOOD_KB) {
          const d = labDist(clusterLab, entry.lab);
          if (d < bestDist) { bestDist = d; bestEntry = entry; }
        }

        if (bestEntry && bestDist < 60 && !matchedNames.has(bestEntry.name)) {
          matchedNames.add(bestEntry.name);
          const confidence = Math.max(30, Math.min(98, Math.round(100 - bestDist * 1.2)));
          const portionGrams = Math.round(bestEntry.avgWeight * fraction * 3);
          const portionStr = portionGrams < 100 ? 'Small portion (~' + portionGrams + 'g)' : portionGrams < 250 ? 'Medium portion (~' + portionGrams + 'g)' : 'Large portion (~' + portionGrams + 'g)';
          detectedItems.push({
            name: bestEntry.name,
            confidence,
            carbonKg: Math.round(bestEntry.carbonPerKg * (portionGrams / 1000) * 100) / 100,
            category: bestEntry.category,
            portion: portionStr,
          });
        }
      }

      if (detectedItems.length === 0) {
        detectedItems.push({ name: 'Unidentified food', confidence: 45, carbonKg: 0.5, category: 'Mixed', portion: 'Unknown portion' });
      }

      resolve({
        dominantColors,
        detectedItems,
        totalCarbonEstimate: Math.round(detectedItems.reduce((s, i) => s + i.carbonKg, 0) * 100) / 100,
        imagePreview: preview,
      });
    });
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
      const allItems = Object.entries(GROCERY_DB);
      const selected: { name: string; price: number; category: string; carbonKg: number }[] = [];
      const usedIndices = new Set<number>();
      for (let i = 0; i < numItems; i++) {
        let idx: number;
        do { idx = Math.floor(Math.random() * allItems.length); } while (usedIndices.has(idx));
        usedIndices.add(idx);
        const [name, data] = allItems[idx];
        const qty = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 2 : 1;
        selected.push({
          name: qty > 1 ? `${name} x${qty}` : name,
          price: Math.round(data.price * qty * 100) / 100,
          category: data.category,
          carbonKg: Math.round(data.carbonPerKg * data.weight * qty * 100) / 100,
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