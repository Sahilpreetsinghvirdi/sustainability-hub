import type {
  WasteAnalysisResponse,
  AgriAnalysisResponse,
  PlantAnalysisResponse,
} from '@/types';
import {
  analyzeWasteImage as _analyzeWasteImage,
  analyzeFertilizer as _analyzeFertilizer,
  analyzePlant as _analyzePlant,
  statusSignal,
} from './directAI';

// This module is now fully local & backend-free. All AI calls go directly to
// the user's own Gemini/OpenAI key from the browser — there is no localhost
// server dependency, so it works identically on Windows, web and mobile.

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

/** Keys are always local — reading never fails and never needs a server. */
export async function fetchAISettings(): Promise<AISettingsResponse> {
  return localToAISettingsResponse(loadLocalAISettings());
}

/** Save AI keys locally (always succeeds). */
export async function updateAISettings(payload: {
  gemini_api_key?: string;
  openai_api_key?: string;
  gemini_model?: string;
  openai_model?: string;
  ai_provider?: string;
}): Promise<AISettingsResponse & { backendSynced: true }> {
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
  return { ...localToAISettingsResponse(next), backendSynced: true };
}

export interface FertilizerContext {
  crop: string;
  growth_stage?: string;
  soil_type?: string;
  irrigation?: string;
  season?: string;
  notes?: string;
}

export interface PlantContext {
  crop?: string;
  growth_stage?: string;
  soil_type?: string;
  notes?: string;
}

export async function analyzeWasteImage(
  file: File | Blob,
  question = '',
  fileName = 'capture.jpg',
): Promise<WasteAnalysisResponse> {
  return _analyzeWasteImage(file, question, fileName);
}

export async function fetchAnalyzerStatus(): Promise<{
  ai_configured: boolean;
  provider: string | null;
  model: string;
}> {
  return statusSignal();
}

export async function analyzeFertilizer(
  file: File | Blob,
  context: FertilizerContext,
): Promise<AgriAnalysisResponse> {
  return _analyzeFertilizer(file, context);
}

export async function analyzePlant(
  file: File | Blob,
  context: PlantContext,
): Promise<PlantAnalysisResponse> {
  return _analyzePlant(file, context);
}

export async function fetchPlantStatus(): Promise<{ ai_configured: boolean; provider: string | null; model: string }> {
  return statusSignal();
}
