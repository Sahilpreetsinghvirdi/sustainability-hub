// mobile/src/store/foodWasteStore.ts
import { create } from 'zustand';
import { FoodWasteLog, FoodWasteStreak, FoodWasteSummary, MealType } from '@/types';
import { foodWasteService } from '@/services/api';

interface FoodWasteState {
  logs: FoodWasteLog[];
  streak: FoodWasteStreak | null;
  summary: FoodWasteSummary | null;

  isLoading: boolean;
  isAnalyzing: boolean;
  analysisProgress: number;
  error: string | null;

  setLogs: (logs: FoodWasteLog[]) => void;
  addLog: (log: FoodWasteLog) => void;
  updateLog: (logId: string, updates: Partial<FoodWasteLog>) => void;
  removeLog: (logId: string) => void;
  setStreak: (streak: FoodWasteStreak) => void;
  setSummary: (summary: FoodWasteSummary) => void;
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setError: (error: string | null) => void;

  fetchLogs: (params?: any) => Promise<void>;
  fetchStreak: () => Promise<void>;
  fetchSummary: (period?: string) => Promise<void>;
  processWasteLog: (mealImageUri: string, wasteImageUri: string, mealType: MealType) => Promise<FoodWasteLog>;
  createManualLog: (data: any) => Promise<FoodWasteLog>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  logs: [],
  streak: null,
  summary: null,
  isLoading: false,
  isAnalyzing: false,
  analysisProgress: 0,
  error: null,
};

export const useFoodWasteStore = create<FoodWasteState>((set, get) => ({
  ...initialState,

  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  updateLog: (logId, updates) =>
    set((state) => ({ logs: state.logs.map((l) => (l.id === logId ? { ...l, ...updates } : l)) })),
  removeLog: (logId) =>
    set((state) => ({ logs: state.logs.filter((l) => l.id !== logId) })),
  setStreak: (streak) => set({ streak }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
  setError: (error) => set({ error }),

  fetchLogs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await foodWasteService.getLogs(params);
      set({ logs: response.logs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch logs', isLoading: false });
    }
  },

  fetchStreak: async () => {
    try {
      const streak = await foodWasteService.getStreak();
      set({ streak });
    } catch (error) {
      // Silently fail
    }
  },

  fetchSummary: async (period = 'month') => {
    try {
      const summary = await foodWasteService.getSummary(period);
      set({ summary });
    } catch (error) {
      // Silently fail
    }
  },

  processWasteLog: async (mealImageUri, wasteImageUri, mealType) => {
    set({ isAnalyzing: true, analysisProgress: 0, error: null });
    try {
      const log = await foodWasteService.processLog(mealImageUri, wasteImageUri, mealType);
      get().addLog(log);
      set({ isAnalyzing: false, analysisProgress: 100 });
      return log;
    } catch (error) {
      set({ isAnalyzing: false, analysisProgress: 0, error: 'Failed to analyze waste' });
      throw error;
    }
  },

  createManualLog: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const log = await foodWasteService.createManualLog(data);
      get().addLog(log);
      set({ isLoading: false });
      return log;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to create log' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

export const useFoodWasteLogs = () => useFoodWasteStore((state) => state.logs);
export const useFoodWasteStreak = () => useFoodWasteStore((state) => state.streak);
export const useFoodWasteSummary = () => useFoodWasteStore((state) => state.summary);
export const useFoodWasteLoading = () => useFoodWasteStore((state) => state.isLoading);
export const useIsAnalyzing = () => useFoodWasteStore((state) => state.isAnalyzing);
export const useAnalysisProgress = () => useFoodWasteStore((state) => state.analysisProgress);
export const useFoodWasteError = () => useFoodWasteStore((state) => state.error);
