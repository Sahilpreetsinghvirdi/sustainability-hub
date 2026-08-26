// mobile/src/store/energyStore.ts
import { create } from 'zustand';
import { EnergyBill, Appliance, EnergyAudit, EnergyRecommendation, EnergySummary } from '@/types';
import { energyService } from '@/services/api';

interface EnergyState {
  bills: EnergyBill[];
  appliances: Appliance[];
  currentAudit: EnergyAudit | null;
  recommendations: EnergyRecommendation[];
  summary: EnergySummary | null;

  isLoading: boolean;
  error: string | null;

  setBills: (bills: EnergyBill[]) => void;
  addBill: (bill: EnergyBill) => void;
  updateBill: (billId: string, updates: Partial<EnergyBill>) => void;
  removeBill: (billId: string) => void;
  setAppliances: (appliances: Appliance[]) => void;
  addAppliance: (appliance: Appliance) => void;
  updateAppliance: (applianceId: string, updates: Partial<Appliance>) => void;
  removeAppliance: (applianceId: string) => void;
  setAudit: (audit: EnergyAudit) => void;
  setRecommendations: (recommendations: EnergyRecommendation[]) => void;
  setSummary: (summary: EnergySummary) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchBills: (params?: any) => Promise<void>;
  fetchAppliances: () => Promise<void>;
  fetchSummary: (period?: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  processBill: (imageUri: string, provider?: string) => Promise<EnergyBill>;
  createManualBill: (data: any) => Promise<EnergyBill>;
  createAppliance: (data: any) => Promise<Appliance>;
  generateAudit: () => Promise<EnergyAudit>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  bills: [],
  appliances: [],
  currentAudit: null,
  recommendations: [],
  summary: null,
  isLoading: false,
  error: null,
};

export const useEnergyStore = create<EnergyState>((set, get) => ({
  ...initialState,

  setBills: (bills) => set({ bills }),
  addBill: (bill) => set((state) => ({ bills: [bill, ...state.bills] })),
  updateBill: (billId, updates) =>
    set((state) => ({ bills: state.bills.map((b) => (b.id === billId ? { ...b, ...updates } : b)) })),
  removeBill: (billId) =>
    set((state) => ({ bills: state.bills.filter((b) => b.id !== billId) })),
  setAppliances: (appliances) => set({ appliances }),
  addAppliance: (appliance) => set((state) => ({ appliances: [...state.appliances, appliance] })),
  updateAppliance: (applianceId, updates) =>
    set((state) => ({ appliances: state.appliances.map((a) => (a.id === applianceId ? { ...a, ...updates } : a)) })),
  removeAppliance: (applianceId) =>
    set((state) => ({ appliances: state.appliances.filter((a) => a.id !== applianceId) })),
  setAudit: (audit) => set({ currentAudit: audit }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchBills: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await energyService.getBills(params);
      set({ bills: response.bills, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bills', isLoading: false });
    }
  },

  fetchAppliances: async () => {
    try {
      const appliances = await energyService.getAppliances();
      set({ appliances });
    } catch (error) {
      // Silently fail
    }
  },

  fetchSummary: async (period = 'month') => {
    try {
      const summary = await energyService.getSummary(period);
      set({ summary });
    } catch (error) {
      // Silently fail
    }
  },

  fetchRecommendations: async () => {
    try {
      const recommendations = await energyService.getRecommendations();
      set({ recommendations });
    } catch (error) {
      // Silently fail
    }
  },

  processBill: async (imageUri, provider) => {
    set({ isLoading: true, error: null });
    try {
      const bill = await energyService.processBill(imageUri, provider);
      get().addBill(bill);
      set({ isLoading: false });
      return bill;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to process bill' });
      throw error;
    }
  },

  createManualBill: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const bill = await energyService.createManualBill(data);
      get().addBill(bill);
      set({ isLoading: false });
      return bill;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to create bill' });
      throw error;
    }
  },

  createAppliance: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const appliance = await energyService.createAppliance(data);
      get().addAppliance(appliance);
      set({ isLoading: false });
      return appliance;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to create appliance' });
      throw error;
    }
  },

  generateAudit: async () => {
    set({ isLoading: true, error: null });
    try {
      const audit = await energyService.generateAudit();
      set({ currentAudit: audit, isLoading: false });
      return audit;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to generate audit' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

export const useEnergyBills = () => useEnergyStore((state) => state.bills);
export const useEnergyAppliances = () => useEnergyStore((state) => state.appliances);
export const useEnergyAudit = () => useEnergyStore((state) => state.currentAudit);
export const useEnergyRecommendations = () => useEnergyStore((state) => state.recommendations);
export const useEnergySummary = () => useEnergyStore((state) => state.summary);
export const useEnergyLoading = () => useEnergyStore((state) => state.isLoading);
export const useEnergyError = () => useEnergyStore((state) => state.error);
