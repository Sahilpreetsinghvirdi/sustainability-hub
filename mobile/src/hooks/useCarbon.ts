// mobile/src/hooks/useCarbon.ts
import { useCallback, useEffect } from 'react';
import { useCarbonStore } from '@/store/carbonStore';
import { carbonService } from '@/services/api';
import { ReceiptScan, ProductCategory } from '@/types';

export function useCarbon() {
  const {
    scans,
    currentScan,
    factors,
    summary,
    isLoading,
    isScanning,
    scanProgress,
    error,
    setScans,
    addScan,
    updateScan,
    removeScan,
    setCurrentScan,
    setFactors,
    setSummary,
    setLoading,
    setScanning,
    setError,
    setScanProgress,
    fetchScans,
    fetchSummary,
    fetchFactors,
    processReceipt,
    createManualReceipt,
    updateItem,
    clearError,
    reset,
  } = useCarbonStore();

  const loadScans = useCallback(async (params?: any) => {
    setLoading(true);
    clearError();
    try {
      await fetchScans(params);
    } catch (err) {
      setError('Failed to load scans');
    } finally {
      setLoading(false);
    }
  }, [fetchScans, setLoading, clearError, setError]);

  const loadSummary = useCallback(async (period = 'month', startDate?: string) => {
    try {
      await fetchSummary(period, startDate);
    } catch (err) {
      // Silently fail
    }
  }, [fetchSummary]);

  const loadFactors = useCallback(async () => {
    try {
      await fetchFactors();
    } catch (err) {
      // Silently fail
    }
  }, [fetchFactors]);

  useEffect(() => {
    loadScans();
    loadSummary();
    loadFactors();
  }, [loadScans, loadSummary, loadFactors]);

  const scanReceipt = useCallback(async (imageUri: string, metadata?: any) => {
    setScanning(true);
    setScanProgress(0);
    clearError();
    try {
      const scan = await processReceipt(imageUri, metadata);
      return scan;
    } catch (err) {
      throw err;
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  }, [processReceipt, setScanning, setScanProgress, clearError]);

  const manualEntry = useCallback(async (data: any) => {
    setLoading(true);
    clearError();
    try {
      const scan = await createManualReceipt(data);
      return scan;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createManualReceipt, setLoading, clearError]);

  const editItem = useCallback(async (itemId: string, updates: any) => {
    try {
      await updateItem(itemId, updates);
    } catch (err) {
      throw err;
    }
  }, [updateItem]);

  const getFactorForCategory = useCallback((category: ProductCategory) => {
    return factors[category];
  }, [factors]);

  const getTotalCarbonThisMonth = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return scans
      .filter(s => new Date(s.scanned_at) >= startOfMonth && s.status === 'completed')
      .reduce((sum, s) => sum + s.total_carbon_kg, 0);
  }, [scans]);

  return {
    scans,
    currentScan,
    factors,
    summary,
    isLoading,
    isScanning,
    scanProgress,
    error,
    loadScans,
    loadSummary,
    scanReceipt,
    manualEntry,
    editItem,
    setCurrentScan,
    getFactorForCategory,
    getTotalCarbonThisMonth,
    refresh: loadScans,
  };
}
