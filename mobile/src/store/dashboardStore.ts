// mobile/src/store/dashboardStore.ts
import { create } from 'zustand';
import { DashboardSummary } from '@/types';
import { dashboardService } from '@/services/api';

interface DashboardState {
  summary: DashboardSummary | null;
  insights: any[];
  achievements: any[];
  trends: any;

  isLoading: boolean;
  error: string | null;

  setSummary: (summary: DashboardSummary) => void;
  setInsights: (insights: any[]) => void;
  setAchievements: (achievements: any[]) => void;
  setTrends: (trends: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchSummary: (period?: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchTrends: (metric: string, period?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  summary: null,
  insights: [],
  achievements: [],
  trends: null,
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...initialState,

  setSummary: (summary) => set({ summary }),
  setInsights: (insights) => set({ insights }),
  setAchievements: (achievements) => set({ achievements }),
  setTrends: (trends) => set({ trends }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchSummary: async (period = 'month') => {
    set({ isLoading: true, error: null });
    try {
      const summary = await dashboardService.getSummary(period);
      set({ summary, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard', isLoading: false });
    }
  },

  fetchInsights: async () => {
    try {
      const insights = await dashboardService.getInsights();
      set({ insights });
    } catch (error) {
      // Silently fail
    }
  },

  fetchAchievements: async () => {
    try {
      const achievements = await dashboardService.getAchievements();
      set({ achievements });
    } catch (error) {
      // Silently fail
    }
  },

  fetchTrends: async (metric = 'carbon', period = 'month') => {
    try {
      const trends = await dashboardService.getTrends(metric, period);
      set({ trends });
    } catch (error) {
      // Silently fail
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

export const useDashboardSummary = () => useDashboardStore((state) => state.summary);
export const useDashboardInsights = () => useDashboardStore((state) => state.insights);
export const useDashboardAchievements = () => useDashboardStore((state) => state.achievements);
export const useDashboardTrends = () => useDashboardStore((state) => state.trends);
export const useDashboardLoading = () => useDashboardStore((state) => state.isLoading);
export const useDashboardError = () => useDashboardStore((state) => state.error);