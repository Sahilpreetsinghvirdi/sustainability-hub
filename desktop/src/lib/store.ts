export interface CarbonEntry { id: string; date: string; items: { name: string; price: number; category: string; carbonKg: number }[]; total: number; totalCarbon: number; store: string }
export interface EnergyBill { id: string; period: string; electricity: number; gas: number; water: number; cost: number }
export interface WasteLog { id: string; date: string; meal: string; desc: string; amount: number; reason: string; carbon: number }

const KEYS = { carbon: 'sh_carbon_entries', energy: 'sh_energy_bills', waste: 'sh_waste_logs' } as const;

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

export const store = {
  getCarbon: () => load<CarbonEntry>(KEYS.carbon),
  addCarbon: (e: CarbonEntry) => { const all = load<CarbonEntry>(KEYS.carbon); all.unshift(e); save(KEYS.carbon, all); },
  getEnergy: () => load<EnergyBill>(KEYS.energy),
  addEnergy: (e: EnergyBill) => { const all = load<EnergyBill>(KEYS.energy); all.unshift(e); save(KEYS.energy, all); },
  getWaste: () => load<WasteLog>(KEYS.waste),
  addWaste: (e: WasteLog) => { const all = load<WasteLog>(KEYS.waste); all.unshift(e); save(KEYS.waste, all); },
  getDashboardData() {
    const carbon = this.getCarbon();
    const energy = this.getEnergy();
    const waste = this.getWaste();
    const totalCarbon = carbon.reduce((s, e) => s + e.totalCarbon, 0);
    const totalEnergy = energy.reduce((s, e) => s + e.electricity, 0);
    const totalWasteKg = waste.reduce((s, e) => s + e.amount, 0) / 1000;
    const totalWasteCarbon = waste.reduce((s, e) => s + e.carbon, 0);
    return { carbon: Math.round(totalCarbon), energy: Math.round(totalEnergy), wasteKg: Math.round(totalWasteKg * 10) / 10, wasteCarbon: Math.round(totalWasteCarbon * 100) / 100, wasteCount: waste.length, carbonEntries: carbon.length, energyBills: energy.length };
  }
};
