// mobile/src/store/carbonStore.ts
import { create } from 'zustand';
import { ReceiptScan, ReceiptItem, CarbonFactor, CarbonSummary, ProductCategory } from '@/types';
import { carbonService } from '@/services/api';

interface CarbonState {
  // Data
  scans: ReceiptScan[];
  currentScan: ReceiptScan | null;
  factors: Record<ProductCategory, CarbonFactor>;
  summary: CarbonSummary | null;

  // UI State
  isLoading: boolean;
  isScanning: boolean;
  error: string | null;
  scanProgress: number;

  // Actions
  setScans: (scans: ReceiptScan[]) => void;
  addScan: (scan: ReceiptScan) => void;
  updateScan: (scanId: string, updates: Partial<ReceiptScan>) => void;
  removeScan: (scanId: string) => void;
  setCurrentScan: (scan: ReceiptScan | null) => void;
  setFactors: (factors: CarbonFactor[]) => void;
  setSummary: (summary: CarbonSummary) => void;
  setLoading: (loading: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setError: (error: string | null) => void;
  setScanProgress: (progress: number) => void;

  // Async actions
  fetchScans: (params?: { page?: number; startDate?: string; endDate?: string }) => Promise<void>;
  fetchSummary: (period?: string, startDate?: string) => Promise<void>;
  fetchFactors: () => Promise<void>;
  processReceipt: (imageUri: string, metadata?: any) => Promise<ReceiptScan>;
  createManualReceipt: (data: any) => Promise<ReceiptScan>;
  updateItem: (itemId: string, updates: Partial<ReceiptItem>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  scans: [],
  currentScan: null,
  factors: {} as Record<ProductCategory, CarbonFactor>,
  summary: null,
  isLoading: false,
  isScanning: false,
  error: null,
  scanProgress: 0,
};

export const useCarbonStore = create<CarbonState>((set, get) => ({
  ...initialState,

  setScans: (scans) => set({ scans }),
  addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
  updateScan: (scanId, updates) =>
    set((state) => ({
      scans: state.scans.map((s) => (s.id === scanId ? { ...s, ...updates } : s)),
      currentScan: state.currentScan?.id === scanId ? { ...state.currentScan, ...updates } : state.currentScan,
    })),
  removeScan: (scanId) =>
    set((state) => ({
      scans: state.scans.filter((s) => s.id !== scanId),
      currentScan: state.currentScan?.id === scanId ? null : state.currentScan,
    })),
  setCurrentScan: (scan) => set({ currentScan: scan }),
  setFactors: (factors) =>
    set({
      factors: factors.reduce((acc, f) => ({ ...acc, [f.product_category]: f }), {}),
    }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
  setScanning: (isScanning) => set({ isScanning }),
  setError: (error) => set({ error }),
  setScanProgress: (scanProgress) => set({ scanProgress }),

  fetchScans: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await carbonService.getScans(params);
      set({ scans: response.items, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch scans', isLoading: false });
    }
  },

  fetchSummary: async (period = 'month', startDate) => {
    try {
      const summary = await carbonService.getSummary(period, startDate);
      set({ summary });
    } catch (error) {
      // Silently fail for summary
    }
  },

  fetchFactors: async () => {
    try {
      const factors = await carbonService.getFactors();
      get().setFactors(factors);
    } catch (error) {
      // Silently fail
    }
  },

  processReceipt: async (imageUri, metadata) => {
    set({ isScanning: true, scanProgress: 0, error: null });
    try {
      const scan = await carbonService.scanReceipt(imageUri, metadata);
      get().addScan(scan);
      set({ isScanning: false, scanProgress: 100 });
      return scan;
    } catch (error) {
      set({ isScanning: false, scanProgress: 0, error: 'Failed to process receipt' });
      throw error;
    }
  },

  createManualReceipt: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const scan = await carbonService.createManualReceipt(data);
      get().addScan(scan);
      set({ isLoading: false });
      return scan;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to create receipt' });
      throw error;
    }
  },

  updateItem: async (itemId, updates) => {
    try {
      await carbonService.updateItem(itemId, updates);
      // Optimistic update handled by API response
    } catch (error) {
      set({ error: 'Failed to update item' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

// Selectors
export const useCarbonScans = () => useCarbonStore((state) => state.scans);
export const useCurrentScan = () => useCarbonStore((state) => state.currentScan);
export const useCarbonSummary = () => useCarbonStore((state) => state.summary);
export const useCarbonFactors = () => useCarbonStore((state) => state.factors);
export const useCarbonLoading = () => useCarbonStore((state) => state.isLoading);
export const useIsScanning = () => useCarbonStore((state) => state.isScanning);
export const useScanProgress = () => useCarbonStore((state) => state.scanProgress);
export const useCarbonError = () => useCarbonStore((state) => state.error);