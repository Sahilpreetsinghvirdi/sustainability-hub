import type { WasteAnalysisResponse } from '../types';

export interface CarbonEntry { id: string; date: string; items: { name: string; price: number; category: string; carbonKg: number }[]; total: number; totalCarbon: number; store: string }
export interface EnergyBill { id: string; period: string; electricity: number; gas: number; water: number; cost: number; provider?: string }
export interface WasteLog { id: string; date: string; meal: string; desc: string; amount: number; reason: string; carbon: number }

export interface WasteHistoryItem {
  id: string;
  ts: string;
  thumb: string;
  question?: string;
  summary: string;
  hazardLevel: WasteAnalysisResponse['overall_hazard']['level'];
  hazardScore: number;
  topMaterials: { name: string; category: string; percentage: number }[];
  foodLogged: boolean;
  result: WasteAnalysisResponse;
}

export interface ApplianceRecord { name: string; type: string; wattage: number; hours: number; efficiency: number; energyStar: boolean }

const KEYS = {
  carbon: 'sh_carbon_entries',
  energy: 'sh_energy_bills',
  waste: 'sh_waste_logs',
  wasteHistory: 'sh_waste_history',
  appliances: 'sh_appliances',
} as const;

const WASTE_HISTORY_CAP = 25;

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save<T>(key: string, data: T[]) {
  let payload = JSON.stringify(data);
  try {
    localStorage.setItem(key, payload);
  } catch {
    // Quota hit — drop oldest half and retry once
    if (data.length > 2) {
      payload = JSON.stringify(data.slice(0, Math.ceil(data.length / 2)));
      try { localStorage.setItem(key, payload); } catch { /* give up quietly */ }
    }
  }
}

// ---------- date helpers ----------
export function todayISO(): string { return new Date().toISOString().split('T')[0]; }

function datesSet(entries: { date: string }[]): Set<string> {
  return new Set(entries.map((e) => e.date));
}

/** Consecutive logging streak (days with >=1 log) ending today or yesterday. */
export function computeStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  const days = datesSet(logs);
  const d = new Date();
  if (!days.has(d.toISOString().split('T')[0])) d.setDate(d.getDate() - 1);
  let streak = 0;
  for (;;) {
    const key = d.toISOString().split('T')[0];
    if (!days.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function bestStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  const days = [...datesSet(logs)].sort();
  let best = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}

/** Last n calendar days oldest→newest with short weekday labels. */
export function lastNDayLabels(n: number): { label: string; iso: string }[] {
  const out: { label: string; iso: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ label: d.toLocaleString('en', { weekday: 'short' }), iso: d.toISOString().split('T')[0] });
  }
  return out;
}

export const store = {
  getCarbon: () => load<CarbonEntry>(KEYS.carbon),
  addCarbon: (e: CarbonEntry) => { const all = load<CarbonEntry>(KEYS.carbon); all.unshift(e); save(KEYS.carbon, all); },

  getEnergy: () => load<EnergyBill>(KEYS.energy),
  addEnergy: (e: EnergyBill) => { const all = load<EnergyBill>(KEYS.energy); all.unshift(e); save(KEYS.energy, all); },

  getWaste: () => load<WasteLog>(KEYS.waste),
  addWaste: (e: WasteLog) => { const all = load<WasteLog>(KEYS.waste); all.unshift(e); save(KEYS.waste, all); },

  getAppliances: (): ApplianceRecord[] => load<ApplianceRecord>(KEYS.appliances),
  addAppliance: (a: ApplianceRecord) => { const all = load<ApplianceRecord>(KEYS.appliances); all.push(a); save(KEYS.appliances, all); },

  // ---------- AI waste analyzer history ----------
  getWasteHistory: () => load<WasteHistoryItem>(KEYS.wasteHistory),
  getLatestWasteAnalysis: (): WasteHistoryItem | null => load<WasteHistoryItem>(KEYS.wasteHistory)[0] ?? null,
  addWasteHistory: (item: WasteHistoryItem) => {
    const all = load<WasteHistoryItem>(KEYS.wasteHistory);
    all.unshift(item);
    save(KEYS.wasteHistory, all.slice(0, WASTE_HISTORY_CAP));
  },
  removeWasteHistory: (id: string) => save(KEYS.wasteHistory, load<WasteHistoryItem>(KEYS.wasteHistory).filter((h) => h.id !== id)),

  getDashboardData() {
    const carbon = this.getCarbon();
    const energy = this.getEnergy();
    const waste = this.getWaste();
    const scans = this.getWasteHistory();
    const totalCarbon = carbon.reduce((s, e) => s + e.totalCarbon, 0);
    const totalEnergy = energy.reduce((s, e) => s + e.electricity, 0);
    const totalWasteKg = waste.reduce((s, e) => s + e.amount, 0) / 1000;
    const totalWasteCarbon = waste.reduce((s, e) => s + e.carbon, 0);
    const weekLogs = waste.filter((l) => l.date >= lastNDayLabels(7)[0].iso);
    return {
      carbon: Math.round(totalCarbon * 10) / 10,
      energy: Math.round(totalEnergy),
      wasteKg: Math.round(totalWasteKg * 10) / 10,
      wasteCarbon: Math.round(totalWasteCarbon * 100) / 100,
      wasteCount: waste.length,
      weekWasteCount: weekLogs.length,
      weekWasteKg: Math.round(weekLogs.reduce((s, l) => s + l.amount, 0) / 100) / 10,
      carbonEntries: carbon.length,
      energyBills: energy.length,
      scans: scans.length,
      streak: computeStreak(waste),
      bestStreak: bestStreak(waste),
    };
  },
};

/** Food-ish categories/names used to auto-link AI waste results into Food Waste Tracker. */
const FOOD_WORDS = [
  'food', 'vegetable', 'fruit', 'rice', 'bread', 'pasta', 'noodle', 'grain', 'leftover',
  'kitchen', 'peel', 'scraps', 'eggshell', 'egg', 'tea', 'coffee', 'leaf', 'leaves',
  'organic waste', 'compost', 'meal', 'fruit and vegetable',
];

export function isOrganicMaterial(name: string, category: string): boolean {
  const c = category.toLowerCase();
  const n = name.toLowerCase();
  if (c.includes('organic') || c.includes('food') || c.includes('compost')) return true;
  return FOOD_WORDS.some((w) => n.includes(w));
}

/** Assumed mass of a scanned garbage pile (grams) for food-waste estimates. */
export const EST_PILE_GRAMS = 1200;
/** kg CO₂e per gram of landfilled food waste. */
export const FOOD_CARBON_PER_GRAM = 0.0025;
