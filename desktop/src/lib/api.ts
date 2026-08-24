import type {
  CarbonScan,
  EnergyBill,
  EnergyAppliance,
  FoodWasteLog,
  UserProfile,
  DashboardSummary,
  WasteAnalysisResponse,
  AgriAnalysisResponse,
} from '@/types';

const API_BASE = 'http://localhost:8000/api/v1';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Multipart upload — must NOT set Content-Type manually (browser adds boundary). */
export async function analyzeWasteImage(
  file: File | Blob,
  question = '',
  fileName = 'capture.jpg',
): Promise<WasteAnalysisResponse> {
  const form = new FormData();
  form.append('file', file, fileName);
  if (question.trim()) form.append('question', question.trim());
  const res = await fetch(`${API_BASE}/waste/analyze`, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `API error ${res.status}`;
    throw new Error(detail);
  }
  return data as WasteAnalysisResponse;
}

export async function fetchAnalyzerStatus(): Promise<{
  ai_configured: boolean;
  provider: string | null;
  model: string;
}> {
  const res = await fetch(`${API_BASE}/waste/status`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface FertilizerContext {
  crop: string;
  growth_stage?: string;
  soil_type?: string;
  irrigation?: string;
  season?: string;
  notes?: string;
}

/** Multipart upload for the AgriSense fertilizer advisor. */
export async function analyzeFertilizer(
  file: File | Blob,
  context: FertilizerContext,
): Promise<AgriAnalysisResponse> {
  const form = new FormData();
  form.append('file', file, file instanceof File ? file.name : 'fertilizer.jpg');
  form.append('crop', context.crop);
  (['growth_stage', 'soil_type', 'irrigation', 'season', 'notes'] as const).forEach((k) => {
    const v = context[k];
    if (v && v.trim()) form.append(k, v.trim());
  });
  const res = await fetch(`${API_BASE}/agri/analyze`, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `API error ${res.status}`;
    throw new Error(detail);
  }
  return data as AgriAnalysisResponse;
}

export const api = {
  carbon: {
    list: () => fetchAPI<CarbonScan[]>('/carbon/scans'),
    get: (id: string) => fetchAPI<CarbonScan>(`/carbon/scans/${id}`),
    create: (data: Partial<CarbonScan>) =>
      fetchAPI<CarbonScan>('/carbon/scans', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/carbon/scans/${id}`, { method: 'DELETE' }),
  },
  energy: {
    listBills: () => fetchAPI<EnergyBill[]>('/energy/bills'),
    createBill: (data: Partial<EnergyBill>) =>
      fetchAPI<EnergyBill>('/energy/bills', { method: 'POST', body: JSON.stringify(data) }),
    listAppliances: () => fetchAPI<EnergyAppliance[]>('/energy/appliances'),
    createAppliance: (data: Partial<EnergyAppliance>) =>
      fetchAPI<EnergyAppliance>('/energy/appliances', { method: 'POST', body: JSON.stringify(data) }),
    getAudit: () => fetchAPI<any>('/energy/audit'),
  },
  foodWaste: {
    list: () => fetchAPI<FoodWasteLog[]>('/food-waste/logs'),
    create: (data: Partial<FoodWasteLog>) =>
      fetchAPI<FoodWasteLog>('/food-waste/logs', { method: 'POST', body: JSON.stringify(data) }),
    getStreak: () => fetchAPI<{ current_streak_days: number; best_streak_days: number }>('/food-waste/streak'),
  },
  profile: {
    get: () => fetchAPI<UserProfile>('/profile'),
    update: (data: Partial<UserProfile>) =>
      fetchAPI<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  dashboard: {
    getSummary: () => fetchAPI<DashboardSummary>('/dashboard/summary'),
  },
};
