// mobile/src/hooks/useFoodWaste.ts
import { useCallback, useEffect } from 'react';
import { useFoodWasteStore } from '@/store/foodWasteStore';
import { foodWasteService } from '@/services/api';
import { FoodWasteLog, MealType } from '@/types';

export function useFoodWaste() {
  const {
    logs,
    streak,
    summary,
    isLoading,
    isAnalyzing,
    analysisProgress,
    error,
    setLogs,
    addLog,
    updateLog,
    removeLog,
    setStreak,
    setSummary,
    setLoading,
    setAnalyzing,
    setAnalysisProgress,
    setError,
    fetchLogs,
    fetchStreak,
    fetchSummary,
    processWasteLog,
    createManualLog,
    clearError,
    reset,
  } = useFoodWasteStore();

  const loadLogs = useCallback(async (params?: any) => {
    setLoading(true);
    clearError();
    try {
      await fetchLogs(params);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [fetchLogs, setLoading, clearError, setError]);

  const loadStreak = useCallback(async () => {
    try {
      await fetchStreak();
    } catch (err) {
      // Silently fail
    }
  }, [fetchStreak]);

  const loadSummary = useCallback(async (period = 'month') => {
    try {
      await fetchSummary(period);
    } catch (err) {
      // Silently fail
    }
  }, [fetchSummary]);

  useEffect(() => {
    loadLogs();
    loadStreak();
    loadSummary();
  }, [loadLogs, loadStreak, loadSummary]);

  const logWaste = useCallback(async (mealImageUri: string, wasteImageUri: string, mealType: MealType) => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    clearError();
    try {
      const log = await processWasteLog(mealImageUri, wasteImageUri, mealType);
      return log;
    } catch (err) {
      throw err;
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [processWasteLog, setAnalyzing, setAnalysisProgress, clearError]);

  const manualLogEntry = useCallback(async (data: any) => {
    setLoading(true);
    clearError();
    try {
      const log = await createManualLog(data);
      return log;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createManualLog, setLoading, clearError]);

  const getTotalWasteThisWeek = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return logs
      .filter(l => new Date(l.logged_at) >= startOfWeek)
      .reduce((sum, l) => sum + l.avoidable_waste_kg + l.unavoidable_waste_kg, 0);
  }, [logs]);

  const getAvoidableWasteThisWeek = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return logs
      .filter(l => new Date(l.logged_at) >= startOfWeek)
      .reduce((sum, l) => sum + l.avoidable_waste_kg, 0);
  }, [logs]);

  const getWasteByMealType = useCallback((mealType: MealType) => {
    return logs.filter(l => l.meal_type === mealType);
  }, [logs]);

  const getCurrentStreak = useCallback(() => {
    return streak?.current_streak_days || 0;
  }, [streak]);

  return {
    logs,
    streak,
    summary,
    isLoading,
    isAnalyzing,
    analysisProgress,
    error,
    loadLogs,
    loadStreak,
    logWaste,
    manualLogEntry,
    getTotalWasteThisWeek,
    getAvoidableWasteThisWeek,
    getWasteByMealType,
    getCurrentStreak,
    refresh: loadLogs,
  };
}
