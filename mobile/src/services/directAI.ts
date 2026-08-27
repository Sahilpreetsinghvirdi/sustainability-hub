// mobile/src/services/directAI.ts
// Direct, backend-free vision AI for the mobile app. Calls Gemini / OpenAI
// directly from the device (or web preview) using the user's own API key —
// no localhost server needed, works on iOS, Android and web.
import { Platform } from 'react-native';
import { useAiConfigStore } from '@/store/aiConfigStore';
import type {
  WasteAnalysisResponse,
  AgriAnalysisResponse,
  PlantAnalysisResponse,
} from './ai';

// ---------------------------------------------------------------------------
// Keys / config (from the on-device aiConfigStore)
// ---------------------------------------------------------------------------

function cfg() {
  return useAiConfigStore.getState();
}

const GEMINI_FALLBACK: Record<string, string> = {
  'gemini-2.0-flash': 'gemini-3.6-flash',
  'gemini-2.5-flash': 'gemini-3.6-flash',
};

function geminiModel(raw: string): string {
  return GEMINI_FALLBACK[raw.trim()] || raw || 'gemini-3.6-flash';
}

export function configuredProviders(): { provider: 'gemini' | 'openai' | null; model: string } {
  const s = cfg();
  if (s.provider === 'openai' && s.openaiKey) return { provider: 'openai', model: s.openaiModel };
  if (s.provider === 'gemini' && s.geminiKey) return { provider: 'gemini', model: geminiModel(s.geminiModel) };
  if (s.openaiKey) return { provider: 'openai', model: s.openaiModel };
  if (s.geminiKey) return { provider: 'gemini', model: geminiModel(s.geminiModel) };
  return { provider: null, model: s.provider === 'openai' ? s.openaiModel : geminiModel(s.geminiModel) };
}

export function aiConfigured(): boolean {
  const s = cfg();
  return !!(s.geminiKey || s.openaiKey);
}

export function statusSignal(): { ai_configured: boolean; provider: string | null; model: string } {
  const c = configuredProviders();
  return { ai_configured: !!c.provider, provider: c.provider, model: c.model };
}

// ---------------------------------------------------------------------------
// Image → base64 (web uses fetch+blob; native uses expo-file-system)
// ---------------------------------------------------------------------------

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      const idx = r.indexOf(',');
      resolve(idx === -1 ? r : r.slice(idx + 1));
    };
    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.readAsDataURL(blob);
  });
}

export async function imageToBase64(uri: string): Promise<string> {
  let b64: string;
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    b64 = await blobToBase64(blob);
  } else {
    const FileSystem = require('expo-file-system');
    b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }
  if (!b64 || b64.length < 8) {
    throw new Error('The selected image could not be read. Please try picking another photo.');
  }
  return b64;
}

export async function guessMime(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      if (blob.type && blob.type.startsWith('image/')) return blob.type;
    } catch { /* ignore */ }
  }
  if (/\.png$/i.test(uri)) return 'image/png';
  if (/\.webp$/i.test(uri)) return 'image/webp';
  return 'image/jpeg';
}

// ---------------------------------------------------------------------------
// Low level LLM call
// ---------------------------------------------------------------------------

async function callVision(prompt: string, imageB64: string, mimeType: string): Promise<Record<string, unknown>> {
  const c = configuredProviders();
  const s = cfg();
  if (!c.provider) {
    throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  }

  if (c.provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent`;
    const payload = {
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageB64 } }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-goog-api-key': s.geminiKey || '' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      throw new Error(`Gemini API error ${res.status}: ${detail}`);
    }
    const data = await res.json();
    const cand = data?.candidates?.[0];
    const finish = cand?.finishReason || 'UNKNOWN';
    const parts = cand?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p?.text ?? '').join('').trim();
    if (!text) {
      throw new Error(`Gemini returned no content (finishReason: ${finish}). The model may have blocked the image for safety, or the key has no quota.`);
    }
    return extractJson(text);
  }

  const payload = {
    model: c.model,
    messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageB64}` } },
      { type: 'text', text: prompt },
    ] }],
    response_format: { type: 'json_object' },
    max_tokens: 4096,
    temperature: 0.2,
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s.openaiKey || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new Error(`OpenAI API error ${res.status}: ${detail}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('Unexpected OpenAI response structure.');
  return extractJson(content);
}

// Streams a Gemini response token-by-token via SSE (`streamGenerateContent?alt=sse`)
// and reports the accumulated text to `onChunk` as it arrives, in real time.
// Returns the fully accumulated text once the stream ends.
async function streamCallVisionGemini(
  prompt: string,
  imageB64: string,
  mimeType: string,
  onChunk: (fullText: string) => void,
): Promise<string> {
  const c = configuredProviders();
  const s = cfg();
  if (!c.provider) {
    throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:streamGenerateContent?alt=sse`;
  const payload = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageB64 } }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': s.geminiKey || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new Error(`Gemini API error ${res.status}: ${detail}`);
  }
  if (!res.body || !('getReader' in res.body)) {
    // No stream support (e.g. some runtimes): fall back to non-streaming JSON.
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p?.text ?? '').join('').trim();
    onChunk(text);
    return text;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let finish = 'UNKNOWN';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/^data:\s*/gm, '');
    // Extract complete SSE lines (separated by blank lines).
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const l = line.trim();
      if (!l.startsWith('{')) continue;
      try {
        const chunk = JSON.parse(l);
        const dr = chunk?.error;
        if (dr) throw new Error(`Gemini API error ${dr.code || '?'}: ${dr.message || ''}`);
        const cand = chunk?.candidates?.[0];
        if (cand?.finishReason) finish = cand.finishReason;
        const t = (cand?.content?.parts ?? []).map((p: { text?: string }) => p?.text ?? '').join('');
        if (t) { full += t; onChunk(full); }
      } catch (pe) { /* skip malformed heartbeat */ }
    }
  }
  if (!full.trim()) {
    throw new Error(`Gemini returned no content (finishReason: ${finish}). The model may have blocked the image, or the key has no quota.`);
  }
  return full;
}

function extractJson(text: string): Record<string, unknown> {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (fence) t = fence[1];
  else {
    const s = t.indexOf('{');
    const e = t.lastIndexOf('}');
    if (s !== -1 && e > s) t = t.slice(s, e + 1);
  }
  try {
    const parsed = JSON.parse(t);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
  } catch { /* fall through */ }
  const snippet = text.length > 160 ? text.slice(0, 160) + '…' : text;
  throw new Error(`The AI response could not be read as a result. The model returned: "${snippet}"`);
}

// ---------------------------------------------------------------------------
// Normalization helpers (graceful)
// ---------------------------------------------------------------------------

function clamp(v: unknown, lo: number, hi: number, def: number): number {
  const f = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  if (Number.isNaN(f)) return def;
  return Math.max(lo, Math.min(hi, f));
}

function asStr(v: unknown, def = ''): string {
  return typeof v === 'string' ? v : v == null ? def : String(v);
}

function asList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asStr(x)).filter(Boolean);
}

function asList2(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asDict(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function normHazard(raw: unknown): { level: string; score: number; toxins: string[]; health_risks: string[] } {
  const d = asDict(raw);
  const valid = ['low', 'medium', 'high', 'critical'];
  let level = asStr(d.level, 'low').toLowerCase();
  if (!valid.includes(level)) level = 'low';
  return {
    level,
    score: Math.round(clamp(d.score, 0, 100, 10)),
    toxins: asList(d.toxins).slice(0, 15),
    health_risks: asList(d.health_risks).slice(0, 15),
  };
}

// ---------------------------------------------------------------------------
// Local heuristic fallbacks (never crash)
// ---------------------------------------------------------------------------

function heuristicWaste(): WasteAnalysisResponse {
  return {
    summary: 'This is an unclassified waste photo. The AI returned an incomplete result, so no materials could be confirmed.',
    overall_hazard: { level: 'low', score: 10, toxins: [], health_risks: [] },
    materials: [],
    recommendations: ['Segregate waste into dry (recyclable) and wet (organic) streams.', 'Dispose of batteries, e-waste and chemicals at dedicated collection points.', 'Avoid open burning or dumping in drains.'],
    environmental_impact: 'Unsegregated waste burdens landfills and can release methane, leachate and toxins if not handled correctly.',
    estimated_decomposition: null,
    analyzer_model: 'local-fallback',
    processing_time_ms: 0,
  };
}

function buildWasteResult(raw: Record<string, unknown>, started: number): WasteAnalysisResponse {
  const mRaw = Array.isArray(raw.materials) ? raw.materials : [];
  const materials = mRaw
    .map((m) => {
      const dm = asDict(m);
      if (!asStr(dm.name)) return null;
      const disposal = asDict(dm.disposal);
      return {
        name: asStr(dm.name).slice(0, 120),
        category: asStr(dm.category, 'other').toLowerCase().replace(/-/g, '_'),
        percentage: clamp(dm.percentage, 0, 100, 0),
        confidence: clamp(dm.confidence, 0, 1, 0.7),
        description: asStr(dm.description),
        hazard: normHazard(dm.hazard),
        common_uses: asList(dm.common_uses).slice(0, 8),
        reuse_ideas: asList(dm.reuse_ideas).slice(0, 8),
        eco_alternatives: asList(dm.eco_alternatives).slice(0, 8),
        disposal: {
          method: asStr(disposal.method, 'Consult local municipal guidelines'),
          destination: asStr(disposal.destination, 'Municipal dry/wet waste collection'),
          recyclable: Boolean(disposal.recyclable),
        },
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .slice(0, 20);
  const total = materials.reduce((s, m) => s + m.percentage, 0);
  const scaled = total > 0
    ? materials.map((m) => ({ ...m, percentage: Math.round((m.percentage / total) * 1000) / 10 })).sort((a, b) => b.percentage - a.percentage)
    : materials;
  return {
    summary: asStr(raw.summary) || 'No analysis summary returned.',
    overall_hazard: normHazard(raw.overall_hazard),
    materials: scaled,
    recommendations: asList(raw.recommendations).slice(0, 10),
    environmental_impact: asStr(raw.environmental_impact),
    estimated_decomposition: raw.estimated_decomposition == null ? null : asStr(raw.estimated_decomposition),
    analyzer_model: configuredProviders().model,
    processing_time_ms: Math.round(Date.now() - started),
  };
}

function heuristicAgri(crop: string): AgriAnalysisResponse {
  return {
    summary: `No reliable identification could be made from the photo for crop "${crop}". Please retake the photo in good light and try again.`,
    product_identification: { name: 'Unknown', type: 'unknown', confidence: 0.1, description: 'Could not identify the product from the image.' },
    nutrient_profile: { npk: '', organic_matter: '', micronutrients: [], ph_effect: '' },
    verdict: { suitability: 'neutral', score: 50, reasoning: 'Unable to assess suitability from the photo.' },
    crop_fit: { suitable_for_current_crop: false, explanation: 'Could not assess.' },
    benefits: [],
    risks_cautions: ['Verify the product before applying to any crop.'],
    application_guidance: [],
    dosage: '',
    best_timing: '',
    alternatives: [],
    environmental_notes: '',
    recommendations: ['Re-upload a clearer photo for an accurate assessment.'],
    analyzer_model: 'local-fallback',
    processing_time_ms: 0,
  };
}

function heuristicPlant(): PlantAnalysisResponse {
  return {
    summary: 'No plant could be reliably identified in the photo. Please retake in better light and try again.',
    plant_identification: { name: 'Unknown', type: 'unknown', confidence: 0.1, description: 'Could not identify a plant from the image.' },
    health: { status: 'unknown', score: 0, reasoning: 'No plant detected.' },
    deficiencies: [],
    diseases: [],
    care_plan: [],
    fertilizer_recommendations: [],
    manures_suggested: [],
    watering_guidance: '',
    light_guidance: '',
    environmental_notes: '',
    recommendations: ['Re-upload a clear photo of the plant for an accurate diagnosis.'],
    analyzer_model: 'local-fallback',
    processing_time_ms: 0,
  };
}

// ---------------------------------------------------------------------------
// Public analysis functions (mirror the old ai.ts signatures)
// ---------------------------------------------------------------------------

const WASTE_PROMPT = `You are an expert waste-management scientist, materials engineer and environmental toxicologist.

Analyze the attached photo of garbage/waste with maximum accuracy. Identify EVERY distinct material or object you can see.

For each material provide:
1. name: specific item/material (e.g. "PET plastic water bottle", "banana peel")
2. category: one of [plastic, paper, organic, metal, glass, e_waste, textile, hazardous, rubber, construction, other]
3. percentage: estimated share of the total pile by visible mass/volume. ALL percentages must sum to ~100.
4. confidence: your detection confidence 0.0-1.0
5. description: 1-2 sentence description
6. hazard: {level: low|medium|high|critical, score: 0-100 harmfulness, toxins: [specific chemicals/compounds e.g. BPA, phthalates, lead, dioxins], health_risks: [...], environmental_risks: [...]}
7. common_uses: what this material is typically used for (2-4 items)
8. reuse_ideas: practical ways this item could be reused/upcycled at home (1-3 items)
9. eco_alternatives: greener replacements for this product (1-3 items)
10. disposal: {method: correct disposal method, destination: where it should go (recycling facility, compost, e-waste collection center, hazardous waste facility, local scrap dealer/kabadiwala etc.), recyclable: bool}

Also return:
- summary: 2-3 sentence overview of the pile
- overall_hazard: aggregate hazard for the whole pile (same shape as per-material hazard)
- recommendations: 3-5 bullet points on safe handling, segregation and next steps
- environmental_impact: short paragraph on impact if landfilled/left in open
- estimated_decomposition: rough decomposition time range of the longest-lived material (e.g. "450+ years")

Rules:
- Base everything ONLY on what is visible; use realistic estimates where exact identification is impossible.
- Consider the Indian context for disposal destinations (dry/wet waste segregation, kabadiwala, municipal collection).
- If the image contains no recognizable waste, return empty materials list and explain in summary.
- Respond ONLY with valid JSON matching exactly this structure:
{"summary": str, "overall_hazard": {"level": str, "score": int, "toxins": [], "health_risks": [], "environmental_risks": []}, "materials": [{"name": str, "category": str, "percentage": float, "confidence": float, "description": str, "hazard": {"level": str, "score": int, "toxins": [], "health_risks": [], "environmental_risks": []}, "common_uses": [], "reuse_ideas": [], "eco_alternatives": [], "disposal": {"method": str, "destination": str, "recyclable": bool}}], "recommendations": [], "environmental_impact": str, "estimated_decomposition": str}

User question: {question}`;

export async function analyzeWaste(imageUri: string, question = ''): Promise<WasteAnalysisResponse> {
  if (!aiConfigured()) throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  const started = Date.now();
  try {
    const [imageB64, mime] = await Promise.all([imageToBase64(imageUri), guessMime(imageUri)]);
    const raw = await callVision(WASTE_PROMPT.replace('{question}', (question || '').trim() || 'Analyze this garbage/waste image.'), imageB64, mime);
    return buildWasteResult(raw, started);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/No AI key|not configured/i.test(msg)) throw e;
    if (/Gemini API error|OpenAI API error/i.test(msg)) throw e;
    if (e instanceof TypeError || /Failed to fetch|Network request failed/i.test(msg)) return heuristicWaste();
    throw e;
  }
}

// Streaming variant of analyzeWaste: reports the model's raw generated text
// token-by-token to `onChunk` in real time, then returns the parsed result.
// Falls back to non-streaming callVision if the SSE stream yields no content
// (e.g. transient empty stream) so the user still gets a result.
export async function streamAnalyzeWaste(
  imageUri: string,
  question = '',
  onChunk: (fullText: string) => void,
): Promise<WasteAnalysisResponse> {
  if (!aiConfigured()) throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  const started = Date.now();
  try {
    const [imageB64, mime] = await Promise.all([imageToBase64(imageUri), guessMime(imageUri)]);
    const c = configuredProviders();
    if (c.provider !== 'gemini') {
      // Streaming is only wired for Gemini SSE; OpenAI falls back to the normal path.
      const raw = await callVision(WASTE_PROMPT.replace('{question}', (question || '').trim() || 'Analyze this garbage/waste image.'), imageB64, mime);
      onChunk(JSON.stringify(raw).slice(0, 800));
      return buildWasteResult(raw, started);
    }
    try {
      const text = await streamCallVisionGemini(
        WASTE_PROMPT.replace('{question}', (question || '').trim() || 'Analyze this garbage/waste image.'),
        imageB64,
        mime,
        onChunk,
      );
      return buildWasteResult(extractJson(text), started);
    } catch (streamErr: any) {
      const sm = streamErr instanceof Error ? streamErr.message : String(streamErr);
      // If the stream produced no content, retry once via the proven non-streaming path
      if (/returned no content/i.test(sm)) {
        onChunk('Stream returned empty — retrying without streaming…');
        const raw = await callVision(WASTE_PROMPT.replace('{question}', (question || '').trim() || 'Analyze this garbage/waste image.'), imageB64, mime);
        onChunk(JSON.stringify(raw).slice(0, 800));
        return buildWasteResult(raw, started);
      }
      throw streamErr;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/No AI key|not configured/i.test(msg)) throw e;
    if (/Gemini API error|OpenAI API error/i.test(msg)) throw e;
    if (e instanceof TypeError || /Failed to fetch|Network request failed/i.test(msg)) return heuristicWaste();
    throw e;
  }
}

const AGRI_PROMPT = `You are a senior agronomist and soil scientist with 30 years of field experience across Indian farms.

A farmer photographed a fertilizer / manure / soil amendment product (the bag, pile or sample in the attached photo).
They want to know whether it is good for THEIR crop under THEIR conditions.

FARMING CONTEXT:
- Crop: {crop}
- Growth stage: {growth_stage}
- Soil type: {soil_type}
- Irrigation: {irrigation}
- Season: {season}
- Farmer notes/question: {notes}

Analyze the photo with maximum accuracy:
1. Identify the product (read any label/bag text visible; otherwise identify from appearance).
2. Estimate its nutrient profile.
3. Judge how suitable it is FOR THIS CROP UNDER THESE CONDITIONS specifically — not generically.

Return this JSON structure EXACTLY:
{"summary": str (2-3 sentences), "product_identification": {"name": str, "type": str, "confidence": float, "description": str}, "nutrient_profile": {"npk": str, "organic_matter": str|null, "micronutrients": [], "ph_effect": str}, "verdict": {"suitability": "beneficial|conditionally_beneficial|neutral|harmful", "score": int 0-100, "reasoning": str}, "crop_fit": {"suitable_for_current_crop": bool, "explanation": str}, "benefits": [], "risks_cautions": [], "application_guidance": [{"title": str, "detail": str}], "dosage": str, "best_timing": str, "alternatives": [], "environmental_notes": str, "recommendations": []}

Rules:
- verdict.reasoning MUST reference the specific crop/soil/stage given above.
- dosage & best_timing: concrete numbers where possible (kg/hectare or g/plant, growth-stage timing).
- risks_cautions: over-application, crop-specific harm (e.g. chloride sensitivity), soil effects.
- Consider Indian farming realities (FPO guidance, soil health card scheme, local availability).
- CRITICAL SAFETY RULE: If the image shows garbage, plastic waste, municipal trash, dumping site, landfill, or any non-agricultural refuse (NOT a fertilizer/manure/soil amendment), you MUST return suitability "harmful", score 0, confidence 0.85-0.95, and a STRONG warning that it must NEVER be applied to any crop/soil — it is toxic, soil-polluting, with zero agronomic value. NEVER use "neutral" for garbage/plastic/municipal waste.
- If the image is blurry/unclear and no product can be identified at all (but not clearly garbage), set confidence low, suitability neutral, and explain in summary.
- Respond ONLY with valid JSON.`;

export interface FertilizerContext {
  crop: string;
  growth_stage?: string;
  soil_type?: string;
  irrigation?: string;
  season?: string;
  notes?: string;
}

export async function analyzeFertilizer(imageUri: string, context: FertilizerContext): Promise<AgriAnalysisResponse> {
  if (!aiConfigured()) throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  const f = (v?: string) => (v || '').trim() || 'not specified';
  const prompt = AGRI_PROMPT
    .replace('{crop}', f(context.crop))
    .replace('{growth_stage}', f(context.growth_stage))
    .replace('{soil_type}', f(context.soil_type))
    .replace('{irrigation}', f(context.irrigation))
    .replace('{season}', f(context.season))
    .replace('{notes}', f(context.notes) === 'not specified' ? 'none' : f(context.notes));
  const started = Date.now();
  try {
    const [imageB64, mime] = await Promise.all([imageToBase64(imageUri), guessMime(imageUri)]);
    const raw = await callVision(prompt, imageB64, mime);
    const pid = asDict(raw.product_identification);
    const npkRaw = asDict(raw.nutrient_profile);
    const verdictRaw = asDict(raw.verdict);
    const fitRaw = asDict(raw.crop_fit);

    let suitability = asStr(verdictRaw.suitability, 'neutral').toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
    const validSuit = ['beneficial', 'conditionally_beneficial', 'neutral', 'harmful'];
    if (!validSuit.includes(suitability)) suitability = 'neutral';
    let score = Math.round(clamp(verdictRaw.score, 0, 100, 50));
    const combined = `${asStr(pid.name).toLowerCase()} ${asStr(pid.type).toLowerCase()}`;
    const isGarbage = ['garbage', 'plastic', 'municipal', 'refuse', 'non-agricultural', 'dumping', 'landfill', 'trash', 'waste pile'].some((k) => combined.includes(k));
    if (isGarbage && suitability === 'neutral') { suitability = 'harmful'; score = Math.min(score, 5); }
    if (suitability === 'neutral' && score <= 15) suitability = 'harmful';

    const guidance = asList2(raw.application_guidance).map((s) => asDict(s)).filter((s) => asStr(s.title)).slice(0, 8).map((s) => ({ title: asStr(s.title).slice(0, 120), detail: asStr(s.detail) }));

    return {
      summary: asStr(raw.summary) || 'No analysis summary returned.',
      product_identification: {
        name: asStr(pid.name, 'Unknown product').slice(0, 150),
        type: asStr(pid.type, 'unknown').slice(0, 80),
        confidence: clamp(pid.confidence, 0, 1, 0.5),
        description: asStr(pid.description),
      },
      nutrient_profile: {
        npk: asStr(npkRaw.npk).slice(0, 200),
        organic_matter: npkRaw.organic_matter == null ? undefined : asStr(npkRaw.organic_matter),
        micronutrients: asList(npkRaw.micronutrients).slice(0, 12),
        ph_effect: asStr(npkRaw.ph_effect),
      },
      verdict: { suitability, score, reasoning: asStr(verdictRaw.reasoning) },
      crop_fit: { suitable_for_current_crop: Boolean(fitRaw.suitable_for_current_crop), explanation: asStr(fitRaw.explanation) },
      benefits: asList(raw.benefits).slice(0, 10),
      risks_cautions: asList(raw.risks_cautions).slice(0, 10),
      application_guidance: guidance,
      dosage: asStr(raw.dosage),
      best_timing: asStr(raw.best_timing),
      alternatives: asList(raw.alternatives).slice(0, 10),
      environmental_notes: asStr(raw.environmental_notes),
      recommendations: asList(raw.recommendations).slice(0, 10),
      analyzer_model: configuredProviders().model,
      processing_time_ms: Math.round(Date.now() - started),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/No AI key|not configured/i.test(msg)) throw e;
    if (/Gemini API error|OpenAI API error/i.test(msg)) throw e;
    if (e instanceof TypeError || /Failed to fetch|Network request failed/i.test(msg)) return heuristicAgri(context.crop);
    throw e;
  }
}

export interface PlantContext {
  crop?: string;
  growth_stage?: string;
  soil_type?: string;
  notes?: string;
}

const PLANT_PROMPT = `You are a senior plant pathologist, agronomist and horticulturist with 30 years of field experience across Indian crops and gardens.

A user photographed a plant (whole plant, leaf, stem, fruit or flower in the attached photo) and wants a full health check.

FARMING CONTEXT (if provided):
- Crop / plant type hint: {crop}
- Growth stage: {growth_stage}
- Soil type: {soil_type}
- Recent notes / symptoms: {notes}

Analyze the photo with maximum accuracy:

1. Identify the plant/crop (read leaves/flowers/fruits; if unclear, say unknown).
2. Assess overall health (healthy / stressed / diseased / critical) and score 0-100.
3. List nutrient deficiencies visible (yellowing, chlorosis, etc.).
4. Diagnose diseases/pests: for each, give pathogen_type (fungus/bacteria/virus/pest/abiotic/unknown), confidence, severity, symptoms and treatment.
5. Provide a practical care plan (watering, light, pruning, hygiene) and specific fertilizer/manure recommendations suitable for Indian availability.
6. Give watering_guidance and light_guidance concisely.

Return this JSON EXACTLY:
{"summary": str (2-3 sentences), "plant_identification": {"name": str, "type": str, "confidence": float, "description": str}, "health": {"status": str, "score": int, "reasoning": str}, "deficiencies": [], "diseases": [{"name": str, "pathogen_type": str, "confidence": float, "severity": str, "symptoms": [], "treatment": str}], "care_plan": [{"title": str, "detail": str}], "fertilizer_recommendations": [], "manures_suggested": [], "watering_guidance": str, "light_guidance": str, "environmental_notes": str, "recommendations": []}

Rules:
- health.reasoning MUST reference visible symptoms in the photo.
- If the image is not a plant (e.g. garbage, product, animal, empty), set plant_identification.confidence low, health.status "unknown", score 0, and explain in summary that no plant was detected — do NOT hallucinate a diagnosis.
- Be conservative: if no disease is visible, return empty diseases list rather than inventing one.
- Consider Indian farming realities (local manures: FYM, vermicompost, neem cake; fertilizers: urea, DAP, NPK; availability).
- Respond ONLY with valid JSON.`;

export async function analyzePlant(imageUri: string, context: PlantContext = {}): Promise<PlantAnalysisResponse> {
  if (!aiConfigured()) throw new Error('No AI key configured. Open Settings → AI Configuration and add a Gemini or OpenAI key.');
  const f = (v?: string) => (v || '').trim() || 'not specified';
  const prompt = PLANT_PROMPT
    .replace('{crop}', f(context.crop))
    .replace('{growth_stage}', f(context.growth_stage))
    .replace('{soil_type}', f(context.soil_type))
    .replace('{notes}', f(context.notes) === 'not specified' ? 'none' : f(context.notes));
  const started = Date.now();
  try {
    const [imageB64, mime] = await Promise.all([imageToBase64(imageUri), guessMime(imageUri)]);
    const raw = await callVision(prompt, imageB64, mime);
    const pid = asDict(raw.plant_identification);
    const health = asDict(raw.health);

    let status = asStr(health.status, 'unknown').toLowerCase().replace(/ /g, '_');
    const validHealth = ['healthy', 'stressed', 'diseased', 'critical', 'unknown'];
    if (!validHealth.includes(status)) status = 'unknown';

    const diseases = asList2(raw.diseases).map((d) => asDict(d)).filter((d) => asStr(d.name)).slice(0, 8).map((d) => ({
      name: asStr(d.name).slice(0, 120),
      pathogen_type: asStr(d.pathogen_type, 'unknown').toLowerCase().slice(0, 20),
      confidence: clamp(d.confidence, 0, 1, 0.5),
      severity: asStr(d.severity, 'medium').toLowerCase().slice(0, 20),
      symptoms: asList(d.symptoms).slice(0, 6),
      treatment: asStr(d.treatment),
    }));

    const care = asList2(raw.care_plan).map((s) => asDict(s)).filter((s) => asStr(s.title)).slice(0, 8).map((s) => ({ title: asStr(s.title).slice(0, 120), detail: asStr(s.detail) }));

    return {
      summary: asStr(raw.summary) || 'No analysis summary returned.',
      plant_identification: {
        name: asStr(pid.name, 'Unknown plant').slice(0, 150),
        type: asStr(pid.type, 'unknown').slice(0, 80),
        confidence: clamp(pid.confidence, 0, 1, 0.5),
        description: asStr(pid.description),
      },
      health: { status, score: Math.round(clamp(health.score, 0, 100, 50)), reasoning: asStr(health.reasoning) },
      deficiencies: asList(raw.deficiencies).slice(0, 10),
      diseases,
      care_plan: care,
      fertilizer_recommendations: asList(raw.fertilizer_recommendations).slice(0, 10),
      manures_suggested: asList(raw.manures_suggested).slice(0, 10),
      watering_guidance: asStr(raw.watering_guidance),
      light_guidance: asStr(raw.light_guidance),
      environmental_notes: asStr(raw.environmental_notes),
      recommendations: asList(raw.recommendations).slice(0, 10),
      analyzer_model: configuredProviders().model,
      processing_time_ms: Math.round(Date.now() - started),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/No AI key|not configured/i.test(msg)) throw e;
    if (/Gemini API error|OpenAI API error/i.test(msg)) throw e;
    if (e instanceof TypeError || /Failed to fetch|Network request failed/i.test(msg)) return heuristicPlant();
    throw e;
  }
}
