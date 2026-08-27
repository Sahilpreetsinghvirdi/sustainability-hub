// mobile/src/services/ai.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAiConfigStore } from '@/store/aiConfigStore';

export interface WasteAnalysisResponse {
  summary: string;
  overall_hazard: { level: string; score: number; toxins: string[]; health_risks: string[] };
  materials: Array<{
    name: string;
    category: string;
    percentage: number;
    confidence: number;
    description: string;
    hazard: { level: string; score: number; toxins: string[]; health_risks: string[] };
    reuse_ideas: string[];
    eco_alternatives: string[];
    disposal: { method: string; destination: string; recyclable: boolean };
  }>;
  recommendations: string[];
  environmental_impact: string;
  estimated_decomposition?: string | null;
  analyzer_model: string;
  processing_time_ms: number;
}

export interface AgriAnalysisResponse {
  summary: string;
  product_identification: { name: string; type: string; confidence: number; description: string };
  nutrient_profile: { npk: string; organic_matter?: string; micronutrients: string[]; ph_effect: string };
  verdict: { suitability: string; score: number; reasoning: string };
  crop_fit: { suitable_for_current_crop: boolean; explanation: string };
  benefits: string[];
  risks_cautions: string[];
  application_guidance: Array<{ title: string; detail: string }>;
  dosage: string;
  best_timing: string;
  alternatives: string[];
  environmental_notes: string;
  recommendations: string[];
  analyzer_model: string;
  processing_time_ms: number;
}

export interface PlantAnalysisResponse {
  summary: string;
  plant_identification: { name: string; type: string; confidence: number; description: string };
  health: { status: string; score: number; reasoning: string };
  deficiencies: string[];
  diseases: Array<{
    name: string;
    pathogen_type: string;
    confidence: number;
    severity: string;
    symptoms: string[];
    treatment: string;
  }>;
  care_plan: Array<{ title: string; detail: string }>;
  fertilizer_recommendations: string[];
  manures_suggested: string[];
  watering_guidance: string;
  light_guidance: string;
  environmental_notes: string;
  recommendations: string[];
  analyzer_model: string;
  processing_time_ms: number;
}

export interface AISettingsResponse {
  gemini_api_key_masked: string | null;
  openai_api_key_masked: string | null;
  gemini_model: string;
  openai_model: string;
  ai_provider: string;
  ai_configured: boolean;
}

const HISTORY_KEY_SH = 'sh_waste_history';
const HISTORY_KEY_AGRI = 'sh_agri_history';
const HISTORY_KEY_PLANT = 'sh_plant_history';
const MAX_HISTORY = 25;

export interface WasteHistoryItem {
  id: string;
  timestamp: string;
  previewUrl: string;
  thumb?: string;
  outcome: WasteAnalysisResponse;
  question?: string;
}

export interface AgriHistoryItem {
  id: string;
  timestamp: string;
  previewUrl: string;
  thumb?: string;
  outcome: AgriAnalysisResponse;
  crop: string;
}

export interface PlantHistoryItem {
  id: string;
  timestamp: string;
  previewUrl: string;
  thumb?: string;
  outcome: PlantAnalysisResponse;
  crop?: string;
}

async function readHistory<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function writeHistory<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export async function getWasteHistory(): Promise<WasteHistoryItem[]> {
  return readHistory<WasteHistoryItem>(HISTORY_KEY_SH);
}

export async function saveWasteHistory(item: WasteHistoryItem): Promise<void> {
  const existing = await getWasteHistory();
  await writeHistory(HISTORY_KEY_SH, [item, ...existing.filter((e) => e.id !== item.id)]);
}

export async function clearWasteHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY_SH);
}

export async function getAgriHistory(): Promise<AgriHistoryItem[]> {
  return readHistory<AgriHistoryItem>(HISTORY_KEY_AGRI);
}

export async function saveAgriHistory(item: AgriHistoryItem): Promise<void> {
  const existing = await getAgriHistory();
  await writeHistory(HISTORY_KEY_AGRI, [item, ...existing.filter((e) => e.id !== item.id)]);
}

export async function clearAgriHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY_AGRI);
}

export async function getPlantHistory(): Promise<PlantHistoryItem[]> {
  return readHistory<PlantHistoryItem>(HISTORY_KEY_PLANT);
}

export async function savePlantHistory(item: PlantHistoryItem): Promise<void> {
  const existing = await getPlantHistory();
  await writeHistory(HISTORY_KEY_PLANT, [item, ...existing.filter((e) => e.id !== item.id)]);
}

export async function clearPlantHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY_PLANT);
}

export async function getAiSettings(): Promise<AISettingsResponse> {
  const s = useAiConfigStore.getState();
  return {
    gemini_api_key_masked: s.geminiKey ? maskKey(s.geminiKey) : null,
    openai_api_key_masked: s.openaiKey ? maskKey(s.openaiKey) : null,
    gemini_model: s.geminiModel,
    openai_model: s.openaiModel,
    ai_provider: s.provider,
    ai_configured: !!(s.geminiKey || s.openaiKey),
  };
}

function maskKey(k: string): string {
  if (k.length <= 4) return '****';
  return `${k.slice(0, 3)}****${k.slice(-4)}`;
}

export async function getWasteStatus(): Promise<{ ai_configured: boolean; provider: string | null; model: string }> {
  const s = useAiConfigStore.getState();
  const provider = s.provider === 'openai' && s.openaiKey
    ? 'openai'
    : s.provider === 'gemini' && s.geminiKey
      ? 'gemini'
      : s.openaiKey
        ? 'openai'
        : s.geminiKey
          ? 'gemini'
          : null;
  return {
    ai_configured: !!(s.geminiKey || s.openaiKey),
    provider,
    model: provider === 'openai' ? s.openaiModel : s.geminiModel,
  };
}

export async function analyzeWaste(
  imageUri: string,
  question?: string,
): Promise<WasteAnalysisResponse> {
  const { analyzeWaste: run } = await import('./directAI');
  return run(imageUri, question ?? '');
}

// Streaming variant: calls back with the model's raw generated text in real time.
export async function streamAnalyzeWaste(
  imageUri: string,
  question: string,
  onChunk: (fullText: string) => void,
): Promise<WasteAnalysisResponse> {
  const { streamAnalyzeWaste: run } = await import('./directAI');
  return run(imageUri, question, onChunk);
}

export async function analyzeFertilizer(
  imageUri: string,
  context: { crop: string; growth_stage?: string; soil_type?: string; irrigation?: string; season?: string; notes?: string },
): Promise<AgriAnalysisResponse> {
  const { analyzeFertilizer: run } = await import('./directAI');
  return run(imageUri, context);
}

export async function analyzePlant(
  imageUri: string,
  context: { crop?: string; growth_stage?: string; soil_type?: string; notes?: string } = {},
): Promise<PlantAnalysisResponse> {
  const { analyzePlant: run } = await import('./directAI');
  return run(imageUri, context);
}

export function relTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
