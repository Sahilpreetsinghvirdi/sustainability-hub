// mobile/src/hooks/useEnergy.ts
import { useCallback, useEffect } from 'react';
import { useEnergyStore } from '@/store/energyStore';
import { energyService } from '@/services/api';
import { EnergyBill, Appliance } from '@/types';

export function useEnergy() {
  const {
    bills,
    appliances,
    currentAudit,
    recommendations,
    summary,
    isLoading,
    error,
    setBills,
    addBill,
    updateBill,
    removeBill,
    setAppliances,
    addAppliance,
    updateAppliance,
    removeAppliance,
    setAudit,
    setRecommendations,
    setSummary,
    setLoading,
    setError,
    fetchBills,
    fetchAppliances,
    fetchSummary,
    fetchRecommendations,
    processBill,
    createManualBill,
    createAppliance,
    generateAudit,
    clearError,
    reset,
  } = useEnergyStore();

  const loadBills = useCallback(async (params?: any) => {
    setLoading(true);
    clearError();
    try {
      await fetchBills(params);
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [fetchBills, setLoading, clearError, setError]);

  const loadAppliances = useCallback(async () => {
    try {
      await fetchAppliances();
    } catch (err) {
      // Silently fail
    }
  }, [fetchAppliances]);

  const loadSummary = useCallback(async (period = 'month') => {
    try {
      await fetchSummary(period);
    } catch (err) {
      // Silently fail
    }
  }, [fetchSummary]);

  const loadRecommendations = useCallback(async () => {
    try {
      await fetchRecommendations();
    } catch (err) {
      // Silently fail
    }
  }, [fetchRecommendations]);

  useEffect(() => {
    loadBills();
    loadAppliances();
    loadSummary();
    loadRecommendations();
  }, [loadBills, loadAppliances, loadSummary, loadRecommendations]);

  const scanBill = useCallback(async (imageUri: string, provider?: string) => {
    setLoading(true);
    clearError();
    try {
      const bill = await processBill(imageUri, provider);
      return bill;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [processBill, setLoading, clearError]);

  const manualBillEntry = useCallback(async (data: any) => {
    setLoading(true);
    clearError();
    try {
      const bill = await createManualBill(data);
      return bill;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createManualBill, setLoading, clearError]);

  const addNewAppliance = useCallback(async (data: any) => {
    setLoading(true);
    clearError();
    try {
      const appliance = await createAppliance(data);
      return appliance;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createAppliance, setLoading, clearError]);

  const editAppliance = useCallback(async (applianceId: string, updates: any) => {
    try {
      await updateAppliance(applianceId, updates);
    } catch (err) {
      throw err;
    }
  }, [updateAppliance]);

  const deleteApplianceItem = useCallback(async (applianceId: string) => {
    try {
      await removeAppliance(applianceId);
    } catch (err) {
      throw err;
    }
  }, [removeAppliance]);

  const runAudit = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const audit = await generateAudit();
      return audit;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateAudit, setLoading, clearError]);

  const getTotalEnergyThisMonth = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return bills
      .filter(b => new Date(b.billing_period_start) >= startOfMonth)
      .reduce((sum, b) => sum + b.electricity_kwh, 0);
  }, [bills]);

  const getTotalCostThisMonth = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return bills
      .filter(b => new Date(b.billing_period_start) >= startOfMonth)
      .reduce((sum, b) => sum + b.total_cost, 0);
  }, [bills]);

  return {
    bills,
    appliances,
    currentAudit,
    recommendations,
    summary,
    isLoading,
    error,
    loadBills,
    loadAppliances,
    scanBill,
    manualBillEntry,
    addNewAppliance,
    editAppliance,
    deleteAppliance: deleteApplianceItem,
    runAudit,
    getTotalEnergyThisMonth,
    getTotalCostThisMonth,
    refresh: loadBills,
  };
}