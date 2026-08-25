import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Droplets,
  History,
  ImagePlus,
  Leaf,
  Loader2,
  RefreshCw,
  Sparkles,
  Sprout,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { AgriAnalysisResponse, Suitability } from '@/types';
import { analyzeFertilizer, fetchAnalyzerStatus } from '@/lib/api';
import { store, type AgriHistoryItem } from '@/lib/store';
import { makeFullImage, makeThumb, relTime } from '@/lib/thumb';

const ANALYSIS_STAGES = [
  'Uploading photo to AI…',
  'Identifying the product & reading labels…',
  'Estimating nutrient profile…',
  'Matching against your crop & soil…',
  'Preparing dosage & application guidance…',
];

const CROPS = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion',
  'Chickpea', 'Mustard', 'Soybean', 'Groundnut', 'Banana', 'Mango', 'Tea', 'Other',
];

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting / Maturity', 'Not sure yet'];
const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red & Laterite', 'Sandy', 'Loamy', 'Clayey', 'Saline / Alkaline', 'Not sure'];
const IRRIGATION = ['Rainfed', 'Flood', 'Drip', 'Sprinkler'];
const SEASONS = ['Kharif (Jun–Oct)', 'Rabi (Nov–Mar)', 'Zaid (Apr–Jun)', 'Year-round'];

const VERDICT_META: Record<Suitability, { label: string; chip: string; icon: typeof CheckCircle2 }> = {
  beneficial: { label: 'Beneficial for this crop', chip: 'bg-success/10 border-success/30 text-success', icon: CheckCircle2 },
  conditionally_beneficial: { label: 'Conditionally beneficial', chip: 'bg-warning/10 border-warning/30 text-warning', icon: CircleAlert },
  neutral: { label: 'Neutral — little effect', chip: 'bg-dark-600 border-dark-400 text-dark-100', icon: Sprout },
  harmful: { label: 'Harmful — do NOT apply to crops', chip: 'bg-error/15 border-error/40 text-error shadow-sm', icon: AlertTriangle },
};

function effectiveSuitability(r: AgriAnalysisResponse): Suitability {
  const raw = r.verdict.suitability;
  const score = r.verdict.score;
  const hay = `${r.product_identification.name} ${r.product_identification.type}`.toLowerCase();
  const isGarbage = /plastic|garbage|municipal|refuse|non-agricultural|dumping|landfill|trash|waste pile/i.test(hay);
  if (isGarbage && raw === 'neutral') return 'harmful';
  if (raw === 'neutral' && score <= 30) return 'harmful';
  return raw;
}
function scoreBarColor(suit: Suitability, score: number): string {
  if (suit === 'harmful') return 'bg-error';
  if (suit === 'conditionally_beneficial') return 'bg-warning';
  if (suit === 'beneficial') return 'bg-success';
  if (score <= 30) return 'bg-error';
  if (score <= 55) return 'bg-warning';
  if (score <= 75) return 'bg-dark-300';
  return 'bg-success';
}
function historyEff(h: AgriHistoryItem): Suitability {
  const isG = /plastic|garbage|municipal|refuse|non-agricultural|dumping|landfill|trash|waste pile/i.test(h.productName.toLowerCase());
  if (isG && h.suitability === 'neutral') return 'harmful';
  if (h.suitability === 'neutral' && h.score <= 30) return 'harmful';
  return h.suitability;
}

const SUIT_DOT: Record<Suitability, string> = {
  beneficial: 'bg-success',
  conditionally_beneficial: 'bg-warning',
  neutral: 'bg-dark-300',
  harmful: 'bg-error',
};
const SUIT_TEXT: Record<Suitability, string> = {
  beneficial: 'text-success',
  conditionally_beneficial: 'text-warning',
  neutral: 'text-dark-200',
  harmful: 'text-error',
};

type AiStatus = { ai_configured: boolean; provider: string | null; model: string };

type RunContext = {
  file: File | Blob;
  previewUrl: string;
  crop: string;
  growthStage: string;
  soilType: string;
  irrigation: string;
  season: string;
  notes: string;
};

type Outcome =
  | { ok: true; data: AgriAnalysisResponse }
  | { ok: false; error: string }
  | null;

let activeRun: RunContext | null = null;
let outcome: Outcome = null;
const subscribers = new Set<(o: NonNullable<Outcome>) => void>();
let suppressAutoRestore = false;

export default function AgriSensePage() {
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [soilType, setSoilType] = useState('');
  const [irrigation, setIrrigation] = useState('');
  const [season, setSeason] = useState('');
  const [notes, setNotes] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<AgriAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<AgriHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const wasAnalyzingRef = useRef(false);

  const refreshHistory = useCallback(() => setHistory(store.getAgriHistory()), []);

  useEffect(() => {
    const sub = (o: NonNullable<Outcome>) => {
      setAnalyzing(false);
      if (o.ok) {
        setResult(o.data); setNote(null);
        setActiveHistoryId(store.getAgriHistory()[0]?.id ?? null);
        refreshHistory();
      } else { setError(o.error); }
    };
    subscribers.add(sub);

    if (activeRun) {
      setImageFile(activeRun.file); setPreviewUrl(activeRun.previewUrl);
      setCrop(activeRun.crop); setGrowthStage(activeRun.growthStage);
      setSoilType(activeRun.soilType); setIrrigation(activeRun.irrigation);
      setSeason(activeRun.season); setNotes(activeRun.notes);
      if (outcome) sub(outcome); else setAnalyzing(true);
    } else if (!suppressAutoRestore) {
      const latest = store.getLatestAgriCheck();
      if (latest) {
        setResult(latest.result); setPreviewUrl(latest.image ?? latest.thumb);
        setCrop(latest.crop); setActiveHistoryId(latest.id);
        setNote('Restored your last fertilizer check — upload a photo above for a new one.');
      }
    }
    refreshHistory();
    fetchAnalyzerStatus().then(setAiStatus).catch(() => setAiStatus(null));
    return () => { subscribers.delete(sub); };
  }, [refreshHistory]);

  useEffect(() => {
    if (!analyzing) return;
    const id = setInterval(() => setStageIdx((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1)), 2400);
    return () => clearInterval(id);
  }, [analyzing]);

  useEffect(() => {
    if (wasAnalyzingRef.current && !analyzing && result && imageFile) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
    wasAnalyzingRef.current = analyzing;
  }, [analyzing, result, imageFile]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null; setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function persistRun(analysis: AgriAnalysisResponse, ctx: RunContext) {
    try {
      let thumb = ctx.previewUrl;
      let fullImage: string | undefined;
      try { thumb = await makeThumb(ctx.previewUrl); } catch {}
      try { fullImage = await makeFullImage(ctx.previewUrl); } catch {}
      store.addAgriHistory({
        id: String(Date.now()), ts: new Date().toISOString(), thumb,
        image: fullImage ?? thumb,
        crop: ctx.crop, productName: analysis.product_identification.name,
        suitability: analysis.verdict.suitability, score: analysis.verdict.score,
        summary: analysis.summary.slice(0, 180),
        context: {
          growth_stage: ctx.growthStage || undefined,
          soil_type: ctx.soilType || undefined,
          irrigation: ctx.irrigation || undefined,
          season: ctx.season || undefined,
        },
        result: analysis,
      });
      refreshHistory();
    } catch {}
  }

  function startRun(ctx: RunContext) {
    suppressAutoRestore = false;
    outcome = null; activeRun = ctx;
    setAnalyzing(true); setError(null); setResult(null); setNote(null); setStageIdx(0);
    analyzeFertilizer(ctx.file, {
      crop: ctx.crop, growth_stage: ctx.growthStage, soil_type: ctx.soilType,
      irrigation: ctx.irrigation, season: ctx.season, notes: ctx.notes,
    })
      .then(async (analysis) => {
        await persistRun(analysis, ctx);
        outcome = { ok: true, data: analysis };
        const eff = effectiveSuitability(analysis);
        const title = eff === 'harmful' ? 'Fertilizer check: Harmful — do not apply' : eff === 'beneficial' ? 'Fertilizer check: Beneficial' : 'Fertilizer check complete';
        window.dispatchEvent(new CustomEvent('analysis-complete', { detail: { kind: 'agri', title, detail: `${analysis.product_identification.name} · ${analysis.verdict.score}/100 ${eff} — ${analysis.summary.slice(0, 96)}`, target: '/agrisense', ok: true } }));
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Analysis failed';
        outcome = { ok: false, error: msg.includes('Failed to fetch') ? 'Cannot reach the backend. Start it with: cd backend && .venv\\Scripts\\python -m uvicorn app.main:app --port 8000' : msg };
        window.dispatchEvent(new CustomEvent('analysis-complete', { detail: { kind: 'agri', title: 'Fertilizer check failed', detail: outcome.error as string, target: '/agrisense', ok: false } }));
      })
      .finally(() => subscribers.forEach((s) => outcome && s(outcome!)));
  }

  function acceptImage(fileLike: File | Blob) {
    setError(null); setResult(null); setNote(null); setActiveHistoryId(null);
    setImageFile(fileLike); setPreviewUrl(URL.createObjectURL(fileLike));
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file (JPG or PNG).'); return; }
    acceptImage(file);
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false });
      streamRef.current = stream; setCameraOn(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch { setCameraError('Could not access the webcam. Grant camera permission or upload a photo instead.'); }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) acceptImage(blob); stopCamera(); }, 'image/jpeg', 0.92);
  }

  function runAnalysis() {
    if (!imageFile || !previewUrl || !crop.trim()) { setError('Please add a photo and select your crop first.'); return; }
    startRun({ file: imageFile, previewUrl, crop, growthStage, soilType, irrigation, season, notes });
  }

  function openHistoryItem(item: AgriHistoryItem) {
    suppressAutoRestore = false;
    stopCamera(); setImageFile(null); setAnalyzing(false); setError(null); setNote(null);
    setCrop(item.crop); setGrowthStage(item.context.growth_stage ?? '');
    setSoilType(item.context.soil_type ?? ''); setIrrigation(item.context.irrigation ?? '');
    setSeason(item.context.season ?? ''); setPreviewUrl(item.image ?? item.thumb);
    setResult(item.result); setActiveHistoryId(item.id);
  }

  function deleteHistoryItem(id: string) {
    store.removeAgriHistory(id); refreshHistory();
    if (activeHistoryId === id) { setActiveHistoryId(null); setResult(null); setPreviewUrl(null); }
  }

  function reset() {
    suppressAutoRestore = true;
    activeRun = null; outcome = null;
    setImageFile(null); setPreviewUrl(null); setResult(null);
    setError(null); setNotes(''); setNote(null); setActiveHistoryId(null);
  }

  const isSavedView = !!activeHistoryId && !!result && !!previewUrl && !imageFile && !analyzing;
  const activeAgriItem = history.find((h) => h.id === activeHistoryId) ?? null;

  if (isSavedView && result && previewUrl && activeAgriItem) {
    const ctxChips = [
      activeAgriItem.crop,
      activeAgriItem.context.growth_stage,
      activeAgriItem.context.soil_type,
      activeAgriItem.context.irrigation,
      activeAgriItem.context.season,
    ].filter(Boolean) as string[];
    const savedAgriImg = activeAgriItem.image ?? previewUrl;
    return (
      <div className="max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden space-y-5 animate-pageIn">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-dark-300 hover:text-dark-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to analyzer
        </button>
        <div className="card-elevated overflow-hidden min-w-0 max-w-full">
          <div className="relative bg-black flex justify-center overflow-hidden">
            <img src={savedAgriImg} alt="Saved check" className="w-full max-w-full max-h-[420px] object-contain" style={{ imageOrientation: 'from-image' } as any} />
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 border-t border-dark-500 bg-dark-700/60 text-xs">
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 capitalize font-medium ${SUIT_TEXT[historyEff(activeAgriItem)]}`}>
                <span className={`w-2 h-2 rounded-full ${SUIT_DOT[historyEff(activeAgriItem)]}`} />
                {activeAgriItem.productName} · {activeAgriItem.score}/100
              </span>
              <span className="text-dark-300">· {relTime(activeAgriItem.ts)}</span>
            </span>
            <span className="inline-flex flex-wrap gap-1.5">
              {ctxChips.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-full bg-dark-600 border border-dark-500 text-[11px] text-dark-100">{c}</span>
              ))}
            </span>
          </div>
        </div>
        <AgriResults result={result} onReset={reset} />
        {history.length > 1 && (
          <div className="flex justify-end pt-2 min-w-0">
            <div className="w-full max-w-[400px] rounded-xl border border-dark-500 bg-dark-700/80 backdrop-blur shadow-sm overflow-hidden min-w-0">
              <button onClick={() => setHistoryExpanded((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-dark-100 hover:bg-dark-600 transition-colors">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" /> Other checks
                  <span className="text-dark-300 font-normal">· {history.length}</span>
                </span>
                {historyExpanded ? <ChevronDown className="w-3.5 h-3.5 text-dark-300" /> : <ChevronUp className="w-3.5 h-3.5 text-dark-300" />}
              </button>
              <div className={`drawer-grid ${historyExpanded ? 'open' : ''}`}>
                <div>
                  <div className="flex gap-2 p-2 scroll-x-contained border-t border-dark-500">
                    {history.map((h) => (
                      <div key={h.id} onClick={() => openHistoryItem(h)} className={`relative group shrink-0 w-[112px] rounded-lg border p-1 cursor-pointer transition-all ${activeHistoryId === h.id ? 'bg-primary/15 border-primary/40' : 'bg-dark-800 border-dark-500 hover:border-primary/30'}`}>
                        <div className="relative">
                          <img src={h.thumb} alt="" className="w-full h-[62px] object-cover rounded-md bg-black" />
                          <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} title="Delete check" className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white/80 hover:text-error hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all shadow">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] font-medium text-dark-100 leading-tight line-clamp-1 mt-1">{h.productName}</p>
                        <p className="text-[9px] text-dark-300 leading-none">{h.crop}</p>
                        <div className="flex items-center justify-between mt-0.5 text-[9px]">
                          <span className={`inline-flex items-center gap-1 capitalize font-medium ${SUIT_TEXT[historyEff(h)]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${SUIT_DOT[historyEff(h)]}`} />
                            {h.score}/100
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
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 on-primary-chip" />
            </div>
            AgriSense
          </h1>
          <p className="text-sm text-dark-200 mt-1.5 max-w-2xl">
            Photograph any fertilizer, manure or soil amendment. The AI reads the product, estimates its nutrients, and tells you whether it truly helps <em>your</em> crop in <em>your</em> soil — with dosage, timing and safer alternatives. Every check is saved to history automatically.
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0 ${aiStatus?.ai_configured ? 'bg-success/10 border-success/30 text-success' : aiStatus === null ? 'bg-error/10 border-error/30 text-error' : 'bg-warning/10 border-warning/30 text-warning'}`}>
          <span className={`w-2 h-2 rounded-full ${aiStatus?.ai_configured ? 'bg-success' : aiStatus === null ? 'bg-error' : 'bg-warning animate-pulse'}`} />
          {aiStatus?.ai_configured ? `${aiStatus.provider} · ${aiStatus.model}` : aiStatus === null ? 'Backend offline' : 'API key not configured'}
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
              <img src={previewUrl} alt="Fertilizer to analyze" className="w-full h-auto max-h-[300px] object-contain bg-black" />
              {!analyzing && (
                <button onClick={() => setImageFile(null)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors" title="Remove image">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-wide text-dark-300 mb-1.5">Notes for the advisor (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={analyzing} rows={3} placeholder='e.g. "Leaves are turning yellow at the tips", "Soil test said pH 8.2"' className="w-full resize-none" />
              <p className="text-[11px] text-dark-300 mt-2">Crop &amp; field details below decide the verdict.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-dark-400 hover:border-primary/50 hover:bg-dark-600/40'}`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center mb-3"><Upload className="w-7 h-7 text-primary" /></div>
              <p className="font-semibold text-dark-50">Drop a fertilizer/manure photo here, or click to browse</p>
              <p className="text-xs text-dark-300 mt-1">Bag with label visible is best · JPG or PNG · up to 10 MB</p>
            </div>
            <div className="flex justify-center">
              <button onClick={startCamera} className="btn-secondary inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Capture with Webcam</button>
            </div>
            {cameraError && <p className="text-sm text-warning text-center">{cameraError}</p>}
          </div>
        )}

        <div className="rounded-xl border border-dark-500 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-dark-300 mb-3 flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Your growing conditions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Crop *</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} disabled={analyzing}><option value="">Select crop…</option>{CROPS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Growth stage</label>
              <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} disabled={analyzing}><option value="">Not sure</option>{GROWTH_STAGES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Soil type</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)} disabled={analyzing}><option value="">Not sure</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Irrigation</label>
              <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)} disabled={analyzing}><option value="">Not sure</option>{IRRIGATION.map((i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-1">Season</label>
              <select value={season} onChange={(e) => setSeason(e.target.value)} disabled={analyzing}><option value="">Not sure</option>{SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={runAnalysis} disabled={analyzing || !imageFile || !crop.trim()} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Consulting the agronomist…' : 'Get Suitability Verdict'}
          </button>
          {previewUrl && !analyzing && (
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline inline-flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Different photo</button>
          )}
        </div>

        {analyzing && (
          <div className="rounded-lg bg-dark-700 border border-dark-500 p-3.5">
            <p className="text-sm text-primary-light flex items-center gap-2 font-medium"><Loader2 className="w-4 h-4 animate-spin" /> {ANALYSIS_STAGES[stageIdx]}</p>
            <div className="mt-3 h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${((stageIdx + 1) / ANALYSIS_STAGES.length) * 88}%` }} />
            </div>
            <p className="text-[11px] text-dark-300 mt-2">Field assessment usually takes 10–40 seconds. You can safely browse other pages — the report appears here when you return.</p>
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
          <AgriResults result={result} onReset={reset} />
        </div>
      )}

      {history.length > 0 && (
        <div className="flex justify-end min-w-0">
          <div className="w-full max-w-[400px] rounded-xl border border-dark-500 bg-dark-700/80 backdrop-blur shadow-sm overflow-hidden min-w-0">
            <button onClick={() => setHistoryExpanded((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-dark-100 hover:bg-dark-600 transition-colors">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-primary" /> Recent checks
                <span className="text-dark-300 font-normal">· {history.length}</span>
                {!historyExpanded && history[0] && (
                  <span className={`hidden sm:inline-flex items-center gap-1 ml-2 text-[11px] font-normal capitalize ${SUIT_TEXT[historyEff(history[0])]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${SUIT_DOT[historyEff(history[0])]}`} />
                    {history[0].productName.slice(0, 18)} · {history[0].score}/100
                  </span>
                )}
              </span>
              {historyExpanded ? <ChevronDown className="w-3.5 h-3.5 text-dark-300" /> : <ChevronUp className="w-3.5 h-3.5 text-dark-300" />}
            </button>
            <div className={`drawer-grid ${historyExpanded ? 'open' : ''}`}>
              <div>
                <div className="flex gap-2 p-2 scroll-x-contained border-t border-dark-500">
                  {history.map((h) => (
                    <div key={h.id} onClick={() => openHistoryItem(h)} className={`relative group shrink-0 w-[112px] rounded-lg border p-1 cursor-pointer transition-all ${activeHistoryId === h.id ? 'bg-primary/15 border-primary/40' : 'bg-dark-800 border-dark-500 hover:border-primary/30'}`}>
                      <div className="relative">
                        <img src={h.thumb} alt="" className="w-full h-[62px] object-cover rounded-md bg-black" />
                        <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} title="Delete check" className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white/80 hover:text-error hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all shadow">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] font-medium text-dark-100 leading-tight line-clamp-1 mt-1">{h.productName}</p>
                      <p className="text-[9px] text-dark-300 leading-none">{h.crop}</p>
                      <div className="flex items-center justify-between mt-0.5 text-[9px]">
                        <span className={`inline-flex items-center gap-1 capitalize font-medium ${SUIT_TEXT[historyEff(h)]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${SUIT_DOT[historyEff(h)]}`} />
                          {h.score}/100
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

function AgriResults({ result, onReset }: { result: AgriAnalysisResponse; onReset: () => void }) {
  const effSuit = effectiveSuitability(result);
  const meta = VERDICT_META[effSuit] ?? VERDICT_META.neutral;
  const VerdictIcon = meta.icon;
  const pid = result.product_identification;
  const npk = result.nutrient_profile;
  const barColor = scoreBarColor(effSuit, result.verdict.score);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-dark-50">Advisory Report</h2>
        <button onClick={onReset} className="btn-ghost inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> New check</button>
      </div>
      <div className="card-elevated p-5"><p className="text-sm text-dark-100 leading-relaxed">{result.summary}</p></div>
      <div className={`rounded-xl border p-5 ${meta.chip} ${effSuit === 'harmful' ? 'ring-1 ring-error/20' : ''}`}>
        <div className="flex items-start gap-4">
          <VerdictIcon className={`w-8 h-8 shrink-0 mt-0.5 ${effSuit === 'harmful' ? 'animate-pulse' : ''}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-base">{meta.label}</h3>
              <span className="text-xs font-mono opacity-80">{pid.name} · {(pid.confidence * 100).toFixed(0)}% confidence</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-dark-600/60 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${result.verdict.score}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[11px] font-mono opacity-75"><span>Suitability score</span><span className={effSuit === 'harmful' ? 'text-error font-bold' : ''}>{result.verdict.score}/100</span></div>
            {effSuit === 'harmful' && (
              <div className="mt-3 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-xs font-semibold text-error flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> DO NOT APPLY — This material will damage your crop and soil. See risks & alternatives below.
              </div>
            )}
            <p className="text-sm mt-3 leading-relaxed opacity-95">{result.verdict.reasoning}</p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Product identified</h4>
          <p className="text-base font-bold text-dark-50">{pid.name}</p>
          <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-dark-600 border border-dark-400 text-xs font-medium text-dark-100 capitalize">{pid.type.replace(/_/g, ' ')}</span>
          {pid.description && <p className="text-sm text-dark-200 mt-3 leading-relaxed">{pid.description}</p>}
        </div>
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Nutrient profile</h4>
          {npk.npk && <p className="font-mono text-sm text-dark-50 bg-dark-700 rounded-lg px-3 py-2 border border-dark-500">{npk.npk}</p>}
          <dl className="mt-3 space-y-1.5 text-sm">
            {npk.organic_matter && <div className="flex gap-2"><dt className="text-dark-300 shrink-0">Organic matter:</dt><dd className="text-dark-100">{npk.organic_matter}</dd></div>}
            {npk.ph_effect && <div className="flex gap-2"><dt className="text-dark-300 shrink-0">Soil pH effect:</dt><dd className="text-dark-100">{npk.ph_effect}</dd></div>}
          </dl>
          {npk.micronutrients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {npk.micronutrients.map((m, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-dark-600 border border-dark-400 text-[11px] text-dark-100">{m}</span>)}
            </div>
          )}
        </div>
      </div>
      <div className="card p-5 border-l-4 !border-l-primary">
        <h4 className="text-sm font-semibold text-dark-50 mb-2 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-primary" /> Fit for {result.crop_fit.suitable_for_current_crop ? 'your crop' : 'your crop — caution advised'}
        </h4>
        <p className="text-sm text-dark-100 leading-relaxed">{result.crop_fit.explanation}</p>
      </div>
      {(result.benefits.length > 0 || result.risks_cautions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.benefits.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-success mb-3">Benefits</h4>
              <ul className="space-y-2">{result.benefits.map((b, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />{b}</li>)}</ul>
            </div>
          )}
          {result.risks_cautions.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-warning mb-3">Risks &amp; cautions</h4>
              <ul className="space-y-2">{result.risks_cautions.map((r, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      {result.application_guidance.length > 0 && (
        <div className="card-elevated p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-4">How to apply</h4>
          <ol className="space-y-4">
            {result.application_guidance.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div><p className="text-sm font-semibold text-dark-50">{step.title}</p><p className="text-sm text-dark-200 mt-0.5 leading-relaxed">{step.detail}</p></div>
              </li>
            ))}
          </ol>
          <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-dark-500">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div><p className="text-xs uppercase tracking-wide text-dark-300 font-semibold">Dosage</p><p className="text-sm text-dark-100 mt-0.5">{result.dosage || '—'}</p></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Droplets className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div><p className="text-xs uppercase tracking-wide text-dark-300 font-semibold">Best timing</p><p className="text-sm text-dark-100 mt-0.5">{result.best_timing || '—'}</p></div>
            </div>
          </div>
        </div>
      )}
      {result.alternatives.length > 0 && (
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Greener / better alternatives</h4>
          <ul className="space-y-1.5">{result.alternatives.map((a, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><Leaf className="w-4 h-4 text-primary shrink-0 mt-0.5" />{a}</li>)}</ul>
        </div>
      )}
      {result.environmental_notes && (
        <div className="card p-5"><h4 className="text-sm font-semibold text-dark-50 mb-2">Environmental impact</h4><p className="text-sm text-dark-200 leading-relaxed">{result.environmental_notes}</p></div>
      )}
      {result.recommendations.length > 0 && (
        <div className="card-elevated p-5">
          <h4 className="text-sm font-semibold text-dark-50 mb-3">Final recommendations</h4>
          <ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="text-sm text-dark-100 flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />{r}</li>)}</ul>
        </div>
      )}
      <p className="text-[11px] text-dark-300 text-center pb-2">
        Analyzed by {result.analyzer_model} in {(result.processing_time_ms / 1000).toFixed(1)}s · Advisory only — always follow the product label &amp; local agronomist guidance.
      </p>
    </div>
  );
}
