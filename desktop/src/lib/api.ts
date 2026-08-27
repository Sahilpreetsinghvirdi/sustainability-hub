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

export interface AISettingsResponse {
  gemini_api_key_masked: string | null;
  openai_api_key_masked: string | null;
  gemini_model: string;
  openai_model: string;
  ai_provider: string;
  ai_configured: boolean;
  gemini_configured: boolean;
  openai_configured: boolean;
}

/**
 * AI keys are persisted to localStorage so the Settings panel works on any
 * machine — even when the local Python backend is not running. The backend is
 * written too when reachable (best-effort), but a missing backend never blocks
 * saving or reading keys.
 */

const AI_LOCAL_KEY = 'sh_ai_settings';

const DEFAULT_AI_LOCAL = {
  gemini_api_key: null as string | null,
  openai_api_key: null as string | null,
  gemini_model: 'gemini-3.6-flash',
  openai_model: 'gpt-4o-mini',
  ai_provider: 'gemini' as 'gemini' | 'openai',
};

interface AISettingsLocal {
  gemini_api_key: string | null;
  openai_api_key: string | null;
  gemini_model: string;
  openai_model: string;
  ai_provider: 'gemini' | 'openai';
}

export function loadLocalAISettings(): AISettingsLocal {
  try {
    const raw = localStorage.getItem(AI_LOCAL_KEY);
    return raw ? { ...DEFAULT_AI_LOCAL, ...JSON.parse(raw) } : { ...DEFAULT_AI_LOCAL };
  } catch {
    return { ...DEFAULT_AI_LOCAL };
  }
}

export function saveLocalAISettings(data: Partial<AISettingsLocal>) {
  const merged = { ...loadLocalAISettings(), ...data };
  try { localStorage.setItem(AI_LOCAL_KEY, JSON.stringify(merged)); } catch {}
  return merged;
}

export function localToAISettingsResponse(l: AISettingsLocal): AISettingsResponse {
  return {
    gemini_api_key_masked: l.gemini_api_key ? maskKey(l.gemini_api_key) : null,
    openai_api_key_masked: l.openai_api_key ? maskKey(l.openai_api_key) : null,
    gemini_model: l.gemini_model,
    openai_model: l.openai_model,
    ai_provider: l.ai_provider,
    ai_configured: !!(l.gemini_api_key || l.openai_api_key),
    gemini_configured: !!l.gemini_api_key,
    openai_configured: !!l.openai_api_key,
  };
}

function maskKey(key: string): string {
  if (key.length <= 6) return '••••' + key.slice(-4);
  return key.slice(0, 4) + '••••••' + key.slice(-4);
}

/** Backend is running + reachable at its configured base URL. */
export async function isBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Read AI settings from the backend when available, otherwise fall back to the
 * local copy. Never throws for a missing backend.
 */
export async function fetchAISettings(): Promise<AISettingsResponse> {
  const local = loadLocalAISettings();
  try {
    const res = await fetch(`${API_BASE}/settings/ai`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch {
    return localToAISettingsResponse(local);
  }
}

/**
 * Save AI keys locally (always works) and push to the backend when reachable.
 * Resolves with a result describing whether the backend sync succeeded.
 */
export async function updateAISettings(payload: {
  gemini_api_key?: string;
  openai_api_key?: string;
  gemini_model?: string;
  openai_model?: string;
  ai_provider?: string;
}): Promise<AISettingsResponse & { backendSynced: boolean }> {
  const local = loadLocalAISettings();
  const next: AISettingsLocal = {
    ...local,
    gemini_api_key: payload.gemini_api_key !== undefined ? payload.gemini_api_key || null : local.gemini_api_key,
    openai_api_key: payload.openai_api_key !== undefined ? payload.openai_api_key || null : local.openai_api_key,
    gemini_model: payload.gemini_model ?? local.gemini_model,
    openai_model: payload.openai_model ?? local.openai_model,
    ai_provider: (payload.ai_provider as AISettingsLocal['ai_provider']) ?? local.ai_provider,
  };
  saveLocalAISettings(next);

  let backendSynced = false;
  try {
    const res = await fetch(`${API_BASE}/settings/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    backendSynced = true;
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object') return { ...(data as AISettingsResponse), backendSynced };
  } catch {
    backendSynced = false;
  }
  return { ...localToAISettingsResponse(next), backendSynced };
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

export interface PlantContext {
  crop?: string;
  growth_stage?: string;
  soil_type?: string;
  notes?: string;
}

export async function analyzePlant(
  file: File | Blob,
  context: PlantContext,
): Promise<import('@/types').PlantAnalysisResponse> {
  const form = new FormData();
  form.append('file', file, file instanceof File ? file.name : 'plant.jpg');
  (['crop', 'growth_stage', 'soil_type', 'notes'] as const).forEach((k) => {
    const v = context[k as keyof PlantContext];
    if (v && String(v).trim()) form.append(k, String(v).trim());
  });
  const res = await fetch(`${API_BASE}/plant/analyze`, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data ? String((data as any).detail) : `API error ${res.status}`;
    throw new Error(detail);
  }
  return data as import('@/types').PlantAnalysisResponse;
}

export async function fetchPlantStatus(): Promise<{ ai_configured: boolean; provider: string | null; model: string }> {
  const res = await fetch(`${API_BASE}/plant/status`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
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
