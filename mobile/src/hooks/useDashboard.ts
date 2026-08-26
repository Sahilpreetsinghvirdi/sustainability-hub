// mobile/src/hooks/useDashboard.ts
import { useCallback, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { dashboardService } from '@/services/api';

export function useDashboard(period = 'month') {
  const {
    summary,
    insights,
    achievements,
    trends,
    isLoading,
    error,
    setSummary,
    setInsights,
    setAchievements,
    setTrends,
    setLoading,
    setError,
    fetchSummary,
    fetchInsights,
    fetchAchievements,
    fetchTrends,
    clearError,
  } = useDashboardStore();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      await Promise.all([
        fetchSummary(period),
        fetchInsights(),
        fetchAchievements(),
      ]);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchSummary, fetchInsights, fetchAchievements, setLoading, setError, clearError, period]);

  const loadTrends = useCallback(async (metric = 'carbon', period = 'month') => {
    try {
      await fetchTrends(metric, period);
    } catch (err) {
      // Silently fail
    }
  }, [fetchTrends]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  return {
    summary,
    insights,
    achievements,
    trends,
    isLoading,
    error,
    refresh,
    loadTrends,
  };
}
