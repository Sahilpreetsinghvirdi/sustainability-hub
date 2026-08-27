import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  FlaskConical,
  HeartPulse,
  History,
  ImagePlus,
  Leaf,
  Loader2,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Sprout,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { PlantAnalysisResponse, HealthStatus } from '@/types';
import { analyzePlant, fetchPlantStatus } from '@/lib/api';
import { store, type PlantHistoryItem } from '@/lib/store';
import { makeFullImage, makeThumb, relTime } from '@/lib/thumb';

const ANALYSIS_STAGES = [
  'Uploading photo to AI…',
  'Identifying the plant…',
  'Checking health & vigor…',
  'Scanning for diseases & pests…',
  'Preparing care & fertilizer plan…',
];

const CROPS = ['Tomato', 'Potato', 'Rice', 'Wheat', 'Maize', 'Cotton', 'Chilli', 'Brinjal', 'Onion', 'Rose', 'Mango', 'Banana', 'Other'];
const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Not sure'];
const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red & Laterite', 'Sandy', 'Loamy', 'Clayey', 'Not sure'];

const HEALTH_META: Record<HealthStatus, { label: string; chip: string; icon: typeof CheckCircle2 }> = {
  healthy: { label: 'Healthy — thriving', chip: 'bg-success/10 border-success/30 text-success', icon: CheckCircle2 },
  stressed: { label: 'Stressed — needs attention', chip: 'bg-warning/10 border-warning/30 text-warning', icon: HeartPulse },
  diseased: { label: 'Diseased — action needed', chip: 'bg-error/10 border-error/30 text-error', icon: Bug },
  critical: { label: 'Critical — urgent care', chip: 'bg-error/15 border-error/40 text-error', icon: ShieldAlert },
  unknown: { label: 'Unknown — unclear photo', chip: 'bg-dark-600 border-dark-400 text-dark-100', icon: ScanSearch },
};

const HEALTH_DOT: Record<HealthStatus, string> = {
  healthy: 'bg-success',
  stressed: 'bg-warning',
  diseased: 'bg-error',
  critical: 'bg-error animate-pulse',
  unknown: 'bg-dark-300',
};
const HEALTH_TEXT: Record<HealthStatus, string> = {
  healthy: 'text-success',
  stressed: 'text-warning',
  diseased: 'text-error',
  critical: 'text-error',
  unknown: 'text-dark-300',
};

function barColor(status: HealthStatus, score: number): string {
  if (status === 'healthy') return 'bg-success';
  if (status === 'critical' || status === 'diseased') return 'bg-error';
  if (status === 'stressed') return 'bg-warning';
  if (score >= 70) return 'bg-success';
  if (score >= 45) return 'bg-warning';
  return 'bg-error';
}

type AiStatus = { ai_configured: boolean; provider: string | null; model: string };
type RunContext = { file: File | Blob; previewUrl: string; crop: string; growthStage: string; soilType: string; notes: string };
type Outcome = { ok: true; data: PlantAnalysisResponse } | { ok: false; error: string } | null;

let activeRun: RunContext | null = null;
let outcome: Outcome = null;
const subscribers = new Set<(o: NonNullable<Outcome>) => void>();
let suppressAutoRestore = false;

export default function PlantSensePage() {
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [soilType, setSoilType] = useState('');
  const [notes, setNotes] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<PlantAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<PlantHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const wasAnalyzingRef = useRef(false);

  const refreshHistory = useCallback(() => setHistory(store.getPlantHistory()), []);

  useEffect(() => {
    const sub = (o: NonNullable<Outcome>) => {
      setAnalyzing(false);
      if (o.ok) {
        setResult(o.data); setNote(null);
        setActiveHistoryId(store.getPlantHistory()[0]?.id ?? null);
        refreshHistory();
      } else setError(o.error);
    };
    subscribers.add(sub);
    if (activeRun) {
      setImageFile(activeRun.file); setPreviewUrl(activeRun.previewUrl);
      setCrop(activeRun.crop); setGrowthStage(activeRun.growthStage);
      setSoilType(activeRun.soilType); setNotes(activeRun.notes);
      if (outcome) sub(outcome); else setAnalyzing(true);
    } else if (!suppressAutoRestore) {
      const latest = store.getLatestPlantCheck();
      if (latest) {
        setResult(latest.result); setPreviewUrl(latest.image ?? latest.thumb);
        setActiveHistoryId(latest.id);
        setNote('Restored your last plant check — upload a new photo above.');
      }
    }
    refreshHistory();
    fetchPlantStatus().then(setAiStatus).catch(() => setAiStatus(null));
    return () => { subscribers.delete(sub); };
  }, [refreshHistory]);

  useEffect(() => {
    if (!analyzing) return;
    const id = setInterval(() => setStageIdx((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1)), 2400);
    return () => clearInterval(id);
  }, [analyzing]);

  useEffect(() => {
    if (wasAnalyzingRef.current && !analyzing && result && imageFile) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
    wasAnalyzingRef.current = analyzing;
  }, [analyzing, result, imageFile]);

  const stopCamera = useCallback(() => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCameraOn(false); }, []);
  useEffect(() => stopCamera, [stopCamera]);

  async function persistRun(analysis: PlantAnalysisResponse, ctx: RunContext) {
    try {
      let thumb = ctx.previewUrl; let full: string | undefined;
      try { thumb = await makeThumb(ctx.previewUrl); } catch {}
      try { full = await makeFullImage(ctx.previewUrl); } catch {}
      store.addPlantHistory({
        id: String(Date.now()), ts: new Date().toISOString(), thumb, image: full ?? thumb,
        plantName: analysis.plant_identification.name,
        healthStatus: analysis.health.status as HealthStatus,
        healthScore: analysis.health.score,
        summary: analysis.summary.slice(0, 180),
        context: { crop: ctx.crop || undefined, growth_stage: ctx.growthStage || undefined, soil_type: ctx.soilType || undefined },
        result: analysis,
      });
      refreshHistory();
    } catch {}
  }

  function startRun(ctx: RunContext) {
    suppressAutoRestore = false; outcome = null; activeRun = ctx;
    setAnalyzing(true); setError(null); setResult(null); setNote(null); setStageIdx(0);
    analyzePlant(ctx.file, { crop: ctx.crop, growth_stage: ctx.growthStage, soil_type: ctx.soilType, notes: ctx.notes })
      .then(async (analysis) => {
        await persistRun(analysis, ctx); outcome = { ok: true, data: analysis };
        const title = analysis.health.status === 'healthy' ? 'Plant is healthy' : analysis.health.status === 'critical' ? 'Plant critical — urgent' : 'Plant diagnosis complete';
        window.dispatchEvent(new CustomEvent('analysis-complete', { detail: { kind: 'agri', title, detail: `${analysis.plant_identification.name} · ${analysis.health.score}/100 ${analysis.health.status} — ${analysis.summary.slice(0, 96)}`, target: '/plantsense', ok: true } }));
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Analysis failed';
        outcome = { ok: false, error: msg.includes('Failed to fetch') ? 'Could not reach the AI provider. Check your internet connection and try again.' : msg };
        window.dispatchEvent(new CustomEvent('analysis-complete', { detail: { kind: 'agri', title: 'Plant check failed', detail: outcome.error as string, target: '/plantsense', ok: false } }));
      })
      .finally(() => subscribers.forEach((s) => outcome && s(outcome!)));
  }

  function acceptImage(f: File | Blob) { setError(null); setResult(null); setNote(null); setActiveHistoryId(null); setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); }
  function handleFiles(files: FileList | null) {
    const f = files?.[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please choose an image file (JPG or PNG).'); return; }
    acceptImage(f);
  }
  async function startCamera() {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false });
      streamRef.current = s; setCameraOn(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = s; });
    } catch { setCameraError('Could not access webcam. Grant permission or upload a photo.'); }
  }
  function capturePhoto() {
    const v = videoRef.current; if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    c.toBlob((b) => { if (b) acceptImage(b); stopCamera(); }, 'image/jpeg', 0.92);
  }
  function runAnalysis() {
    if (!imageFile || !previewUrl) { setError('Please add a plant photo first.'); return; }
    startRun({ file: imageFile, previewUrl, crop, growthStage, soilType, notes });
  }
  function openHistoryItem(item: PlantHistoryItem) {
    suppressAutoRestore = false; stopCamera(); setImageFile(null); setAnalyzing(false); setError(null); setNote(null);
    setCrop(item.context.crop ?? ''); setGrowthStage(item.context.growth_stage ?? ''); setSoilType(item.context.soil_type ?? '');
    setPreviewUrl(item.image ?? item.thumb); setResult(item.result); setActiveHistoryId(item.id);
  }
  function deleteHistoryItem(id: string) {
    store.removePlantHistory(id); refreshHistory();
    if (activeHistoryId === id) { setActiveHistoryId(null); setResult(null); setPreviewUrl(null); }
  }
  function reset() { suppressAutoRestore = true; activeRun = null; outcome = null; setImageFile(null); setPreviewUrl(null); setResult(null); setError(null); setNote(null); setActiveHistoryId(null); }

  const isSavedView = !!activeHistoryId && !!result && !!previewUrl && !imageFile && !analyzing;
  const activeItem = history.find((h) => h.id === activeHistoryId) ?? null;

  if (isSavedView && result && previewUrl && activeItem) {
    const ctxChips = [activeItem.context.crop, activeItem.context.growth_stage, activeItem.context.soil_type].filter(Boolean) as string[];
    const savedImg = activeItem.image ?? previewUrl;
    return (
      <div className="max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden space-y-5 animate-pageIn">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-dark-300 hover:text-dark-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to PlantSense
        </button>
        <div className="card-elevated overflow-hidden min-w-0 max-w-full">
          <div className="relative bg-black flex justify-center overflow-hidden">
            <img src={savedImg} alt="Saved plant" className="w-full max-w-full max-h-[420px] object-contain" style={{ imageOrientation: 'from-image' } as any} />
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 border-t border-dark-500 bg-dark-700/60 text-xs">
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 capitalize font-medium ${HEALTH_TEXT[activeItem.healthStatus]}`}>
                <span className={`w-2 h-2 rounded-full ${HEALTH_DOT[activeItem.healthStatus]}`} />
                {activeItem.plantName} · {activeItem.healthScore}/100
              </span>
              <span className="text-dark-300">· {relTime(activeItem.ts)}</span>
            </span>
            <span className="inline-flex flex-wrap gap-1.5">
              {ctxChips.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-dark-600 border border-dark-500 text-[11px] text-dark-100">{c}</span>)}
            </span>
          </div>
        </div>
        <PlantResults result={result} onReset={reset} />
        {history.length > 1 && (
          <div className="flex justify-end pt-2 min-w-0">
            <div className="w-full max-w-[400px] rounded-xl border border-dark-500 bg-dark-700/80 backdrop-blur shadow-sm overflow-hidden min-w-0">
              <button onClick={() => setHistoryExpanded((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-dark-100 hover:bg-dark-600 transition-colors">
                <span className="text-xs font-semibold flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-primary" /> Other checks <span className="text-dark-300 font-normal">· {history.length}</span></span>
                {historyExpanded ? <ChevronDown className="w-3.5 h-3.5 text-dark-300" /> : <ChevronUp className="w-3.5 h-3.5 text-dark-300" />}
              </button>
              <div className={`drawer-grid ${historyExpanded ? 'open' : ''}`}>
                <div>
                  <div className="flex gap-2 p-2 scroll-x-contained border-t border-dark-500">
                    {history.map((h) => (
                      <div key={h.id} onClick={() => openHistoryItem(h)} className={`relative group shrink-0 w-[112px] rounded-lg border p-1 cursor-pointer transition-all ${activeHistoryId === h.id ? 'bg-primary/15 border-primary/40' : 'bg-dark-800 border-dark-500 hover:border-primary/30'}`}>
                        <div className="relative">
                          <img src={h.thumb} alt="" className="w-full h-[62px] object-cover rounded-md bg-black" />
                          <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white/80 hover:text-error opacity-0 group-hover:opacity-100 transition-all shadow"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <p className="text-[10px] font-medium text-dark-100 leading-tight line-clamp-1 mt-1">{h.plantName}</p>
                        <div className="flex items-center justify-between mt-0.5 text-[9px]">
                          <span className={`inline-flex items-center gap-1 capitalize font-medium ${HEALTH_TEXT[h.healthStatus]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_DOT[h.healthStatus]}`} />{h.healthStatus}
                          </span>
                          <span className="text-dark-300">{relTime(h.ts)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden space-y-6 relative">
      <div className="flex items-start justify-between gap-4 flex-wrap min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            PlantSense
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase">New</span>
          </h1>
          <p className="text-sm text-dark-200 mt-1.5 max-w-2xl">
            Photograph any plant, leaf or crop. AI diagnoses health, deficiencies and diseases (fungus/bacteria/virus/pest) — with care plan and fertilizer/manure suggestions. Every check is saved.
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0 ${aiStatus?.ai_configured ? 'bg-success/10 border-success/30 text-success' : aiStatus === null ? 'bg-error/10 border-error/30 text-error' : 'bg-warning/10 border-warning/30 text-warning'}`}>
          <span className={`w-2 h-2 rounded-full ${aiStatus?.ai_configured ? 'bg-success' : aiStatus === null ? 'bg-error' : 'bg-warning animate-pulse'}`} />
          {aiStatus?.ai_configured ? `${aiStatus.provider} · ${aiStatus.model}` : aiStatus === null ? 'Checking…' : 'API key not configured'}
        </span>
      </div>

      <div className="card-elevated p-5 space-y-5 min-w-0 max-w-full overflow-x-hidden">
        {cameraOn ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[420px] mx-auto w-full">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={capturePhoto} className="btn-primary inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Capture Photo</button>
              <button onClick={stopCamera} className="btn-outline inline-flex items-center gap-2 !border-error/60 !text-error hover:!bg-error/10"><X className="w-4 h-4" /> Stop Camera</button>
            </div>
          </div>
        ) : previewUrl && imageFile ? (
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative rounded-xl overflow-hidden border border-dark-400 md:w-[46%] shrink-0">
              <img src={previewUrl} alt="Plant to diagnose" className="w-full h-auto max-h-[300px] object-contain bg-black" />
              {!analyzing && (
                <button onClick={() => setImageFile(null)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors" title="Remove image">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-wide text-dark-300 mb-1.5">Symptoms / notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={analyzing} rows={3} placeholder='e.g. "yellow spots on leaves, wilting, small insects"' className="w-full resize-none" />
              <p className="text-[11px] text-dark-300 mt-2">Add what you see — AI uses it for diagnosis.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-dark-400 hover:border-emerald-500/50 hover:bg-dark-600/40'}`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-3"><Upload className="w-7 h-7 text-emerald-600" /></div>
              <p className="font-semibold text-dark-50">Drop a plant photo here, or click to browse</p>
              <p className="text-xs text-dark-300 mt-1">Leaf / whole plant · JPG or PNG · up to 10 MB</p>
            </div>
            <div className="flex justify-center">
              <button onClick={startCamera} className="btn-secondary inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Capture with Webcam</button>
            </div>
            {cameraError && <p className="text-sm text-warning text-center">{cameraError}</p>}
          </div>
        )}

        <div className="rounded-xl border border-dark-500 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-dark-300 mb-3 flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5" /> Plant context (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Crop / Plant</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} disabled={analyzing}>
                <option value="">Select…</option>{CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Growth stage</label>
              <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} disabled={analyzing}>
                <option value="">Not sure</option>{GROWTH_STAGES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Soil type</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)} disabled={analyzing}>
                <option value="">Not sure</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={runAnalysis} disabled={analyzing || !imageFile} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartPulse className="w-4 h-4" />}
            {analyzing ? 'Diagnosing…' : 'Diagnose Plant'}
          </button>
          {previewUrl && !analyzing && (
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline inline-flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Different photo</button>
          )}
        </div>

        {analyzing && (
          <div className="rounded-lg bg-dark-700 border border-dark-500 p-3.5">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium"><Loader2 className="w-4 h-4 animate-spin" /> {ANALYSIS_STAGES[stageIdx]}</p>
            <div className="mt-3 h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${((stageIdx + 1) / ANALYSIS_STAGES.length) * 88}%` }} />
            </div>
            <p className="text-[11px] text-dark-300 mt-2">Plant diagnosis takes 10–40s. You can browse other pages — results appear when you return.</p>
          </div>
        )}

        {error && <div className="rounded-lg border border-error/30 bg-error/10 p-3.5 text-sm text-error whitespace-pre-wrap">{error}</div>}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {note && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3 text-sm text-primary-light flex items-center gap-2">
          <History className="w-4 h-4 shrink-0" /> {note}
        </div>
      )}

      {result && !isSavedView && (
        <div ref={resultsRef} className="scroll-mt-4 animate-pageIn">
          <PlantResults result={result} onReset={reset} />
        </div>
      )}

      {history.length > 0 && (
        <div className="flex justify-end min-w-0">
          <div className="w-full max-w-[400px] rounded-xl border border-dark-500 bg-dark-700/80 backdrop-blur shadow-sm overflow-hidden min-w-0">
            <button onClick={() => setHistoryExpanded((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-dark-100 hover:bg-dark-600 transition-colors">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-500" /> Recent plant checks
                <span className="text-dark-300 font-normal">· {history.length}</span>
                {!historyExpanded && history[0] && (
                  <span className={`hidden sm:inline-flex items-center gap-1 ml-2 text-[11px] font-normal capitalize ${HEALTH_TEXT[history[0].healthStatus]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_DOT[history[0].healthStatus]}`} />
                    {history[0].plantName.slice(0, 16)} · {history[0].healthScore}/100
                  </span>
                )}
              </span>
              {historyExpanded ? <ChevronDown className="w-3.5 h-3.5 text-dark-300" /> : <ChevronUp className="w-3.5 h-3.5 text-dark-300" />}
            </button>
            <div className={`drawer-grid ${historyExpanded ? 'open' : ''}`}>
              <div>
                <div className="flex gap-2 p-2 scroll-x-contained border-t border-dark-500">
                  {history.map((h) => (
                    <div key={h.id} onClick={() => openHistoryItem(h)} className={`relative group shrink-0 w-[112px] rounded-lg border p-1 cursor-pointer transition-all ${activeHistoryId === h.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-dark-800 border-dark-500 hover:border-emerald-500/30'}`}>
                      <div className="relative">
                        <img src={h.thumb} alt="" className="w-full h-[62px] object-cover rounded-md bg-black" />
                        <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white/80 hover:text-error opacity-0 group-hover:opacity-100 transition-all shadow"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <p className="text-[10px] font-medium text-dark-100 leading-tight line-clamp-1 mt-1">{h.plantName}</p>
                      <div className="flex items-center justify-between mt-0.5 text-[9px]">
                        <span className={`inline-flex items-center gap-1 capitalize font-medium ${HEALTH_TEXT[h.healthStatus]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_DOT[h.healthStatus]}`} />{h.healthScore}/100
                        </span>
                        <span className="text-dark-300">{relTime(h.ts)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlantResults({ result, onReset }: { result: PlantAnalysisResponse; onReset: () => void }) {
  const meta = HEALTH_META[result.health.status as HealthStatus] ?? HEALTH_META.unknown;
  const VerdictIcon = meta.icon;
  const pid = result.plant_identification;
  const bar = barColor(result.health.status as HealthStatus, result.health.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-dark-50">Diagnosis Report</h2>
        <button onClick={onReset} className="btn-ghost inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> New check</button>
      </div>

      <div className="card-elevated p-5"><p className="text-sm text-dark-100 leading-relaxed">{result.summary}</p></div>

      <div className={`rounded-xl border p-5 ${meta.chip} ${result.health.status === 'critical' || result.health.status === 'diseased' ? 'ring-1 ring-error/20' : ''}`}>
        <div className="flex items-start gap-4">
          <VerdictIcon className={`w-8 h-8 shrink-0 mt-0.5 ${result.health.status === 'critical' ? 'animate-pulse' : ''}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-base">{meta.label}</h3>
              <span className="text-xs font-mono opacity-80">{pid.name} · {(pid.confidence * 100).toFixed(0)}% confidence</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-dark-600/60 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${result.health.score}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[11px] font-mono opacity-75"><span>Health score</span><span className={result.health.status === 'critical' || result.health.status === 'diseased' ? 'text-error font-bold' : ''}>{result.health.score}/100</span></div>
            <p className="text-sm mt-3 leading-relaxed opacity-95">{result.health.reasoning}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Plant identified</h4>
          <p className="text-base font-bold text-dark-50">{pid.name}</p>
          <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-dark-600 border border-dark-400 text-xs font-medium text-dark-100 capitalize">{pid.type.replace(/_/g, ' ')}</span>
          {pid.description && <p className="text-sm text-dark-200 mt-3 leading-relaxed">{pid.description}</p>}
        </div>
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Quick guidance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><Droplets className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" /><div><p className="font-medium text-dark-50">Water</p><p className="text-dark-200">{result.watering_guidance || '—'}</p></div></div>
            <div className="flex gap-2"><Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><div><p className="font-medium text-dark-50">Light</p><p className="text-dark-200">{result.light_guidance || '—'}</p></div></div>
          </div>
        </div>
      </div>

      {result.deficiencies.length > 0 && (
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Deficiencies</h4>
          <ul className="space-y-1.5">{result.deficiencies.map((d, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />{d}</li>)}</ul>
        </div>
      )}

      {result.diseases.length > 0 && (
        <div className="card-elevated p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3 flex items-center gap-2"><Bug className="w-4 h-4 text-error" /> Diseases & pests</h4>
          <div className="space-y-4">
            {result.diseases.map((d, i) => (
              <div key={i} className="rounded-xl border border-dark-500 bg-dark-700/50 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-dark-50">{d.name}</p>
                  <span className="text-xs px-2 py-1 rounded-full border capitalize bg-dark-600 border-dark-400 text-dark-100">{d.pathogen_type} · {d.severity} · {(d.confidence * 100).toFixed(0)}%</span>
                </div>
                {d.symptoms.length > 0 && <p className="text-xs text-dark-300 mt-2">Symptoms: {d.symptoms.join(' · ')}</p>}
                {d.treatment && <p className="text-sm text-dark-100 mt-2 leading-relaxed"><strong>Treatment:</strong> {d.treatment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.care_plan.length > 0 && (
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Care plan</h4>
          <ol className="space-y-3">
            {result.care_plan.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div><p className="text-sm font-semibold text-dark-50">{s.title}</p><p className="text-sm text-dark-200 mt-0.5 leading-relaxed">{s.detail}</p></div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(result.fertilizer_recommendations.length > 0 || result.manures_suggested.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.fertilizer_recommendations.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-dark-50 mb-3 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /> Fertilizers</h4>
              <ul className="space-y-1.5">{result.fertilizer_recommendations.map((f, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><Leaf className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</li>)}</ul>
              <a href="/agrisense" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light mt-3">Check product in AgriSense →</a>
            </div>
          )}
          {result.manures_suggested.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-dark-50 mb-3 flex items-center gap-2"><Sprout className="w-4 h-4 text-success" /> Manures / Organics</h4>
              <ul className="space-y-1.5">{result.manures_suggested.map((m, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><Sprout className="w-4 h-4 text-success shrink-0 mt-0.5" />{m}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="card-elevated p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Final recommendations</h4>
          <ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />{r}</li>)}</ul>
        </div>
      )}
      {result.environmental_notes && <div className="card p-5"><h4 className="text-sm font-semibold text-dark-50 mb-2">Environmental notes</h4><p className="text-sm text-dark-200 leading-relaxed">{result.environmental_notes}</p></div>}
      <p className="text-[11px] text-dark-300 text-center pb-2">
        Analyzed by {result.analyzer_model} in {(result.processing_time_ms / 1000).toFixed(1)}s · For severe infestations, consult your local Krishi Vigyan Kendra.
      </p>
    </div>
  );
}
