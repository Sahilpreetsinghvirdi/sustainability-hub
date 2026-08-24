import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  History,
  ImagePlus,
  Loader2,
  RefreshCw,
  ScanSearch,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import type { WasteAnalysisResponse } from '@/types';
import { analyzeWasteImage, fetchAnalyzerStatus } from '@/lib/api';
import AnalysisResults from '@/components/waste/AnalysisResults';
import {
  store,
  todayISO,
  isOrganicMaterial,
  EST_PILE_GRAMS,
  FOOD_CARBON_PER_GRAM,
  type WasteHistoryItem,
} from '@/lib/store';

const ANALYSIS_STAGES = [
  'Uploading image to AI…',
  'Identifying materials in the photo…',
  'Estimating composition percentages…',
  'Assessing toxins & harmfulness…',
  'Preparing uses, alternatives & disposal guidance…',
];

type AiStatus = { ai_configured: boolean; provider: string | null; model: string };

// ---- survives route navigation while an analysis is in flight ----
type ActiveRun = { file: File | Blob; previewUrl: string; question: string };
type Outcome =
  | { ok: true; data: WasteAnalysisResponse }
  | { ok: false; error: string }
  | null;

let activeRun: ActiveRun | null = null;
let outcome: Outcome = null;
const subscribers = new Set<(o: NonNullable<Outcome>) => void>();

function foodMaterialsOf(r: WasteAnalysisResponse) {
  return r.materials.filter((m) => isOrganicMaterial(m.name, m.category));
}
function estimateFoodGrams(r: WasteAnalysisResponse) {
  return Math.round(
    (foodMaterialsOf(r).reduce((s, m) => s + m.percentage, 0) / 100) * EST_PILE_GRAMS,
  );
}

async function makeThumb(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 260;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no ctx'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = reject;
    img.src = src;
  });
}

function relTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const HAZARD_DOT: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-error',
  critical: 'bg-error animate-pulse',
};
const HAZARD_TEXT: Record<string, string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-error',
  critical: 'text-error',
};

export default function WasteAnalyzerPage() {
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<WasteAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<WasteHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshHistory = useCallback(() => setHistory(store.getWasteHistory()), []);

  // Reconnect to an in-flight run (navigation-safe), else restore last saved scan
  useEffect(() => {
    const sub = (o: NonNullable<Outcome>) => {
      setAnalyzing(false);
      if (o.ok) {
        setResult(o.data);
        setNote(null);
        setActiveHistoryId(store.getWasteHistory()[0]?.id ?? null);
        refreshHistory();
      } else {
        setError(o.error);
      }
    };
    subscribers.add(sub);

    if (activeRun) {
      setImageFile(activeRun.file);
      setPreviewUrl(activeRun.previewUrl);
      setQuestion(activeRun.question);
      if (outcome) sub(outcome);
      else setAnalyzing(true);
    } else {
      const latest = store.getLatestWasteAnalysis();
      if (latest) {
        setResult(latest.result);
        setPreviewUrl(latest.thumb);
        setActiveHistoryId(latest.id);
        setNote('Restored your last scan — pick a photo above to start a new one.');
      }
    }
    refreshHistory();

    fetchAnalyzerStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus(null));

    return () => {
      subscribers.delete(sub);
    };
  }, [refreshHistory]);

  // Rotate the informative progress stages while analyzing
  useEffect(() => {
    if (!analyzing) return;
    const id = setInterval(() => {
      setStageIdx((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1));
    }, 2200);
    return () => clearInterval(id);
  }, [analyzing]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function persistRun(analysis: WasteAnalysisResponse, preview: string, q: string) {
    try {
      let thumb = preview;
      try {
        thumb = await makeThumb(preview);
      } catch {
        /* fall back to original preview URL */
      }

      const organics = foodMaterialsOf(analysis);
      const grams = estimateFoodGrams(analysis);
      let foodLogged = false;
      if (organics.length > 0 && grams >= 30) {
        const carbon = Math.round(grams * FOOD_CARBON_PER_GRAM * 100) / 100;
        store.addWaste({
          id: `ai-${Date.now()}`,
          date: todayISO(),
          meal: 'Snack',
          desc: organics.map((m) => m.name).join(', ').slice(0, 140),
          amount: grams,
          reason: 'AI detected',
          carbon,
        });
        foodLogged = true;
      }

      store.addWasteHistory({
        id: String(Date.now()),
        ts: new Date().toISOString(),
        thumb,
        question: q || undefined,
        summary: analysis.summary.slice(0, 180),
        hazardLevel: analysis.overall_hazard.level,
        hazardScore: analysis.overall_hazard.score,
        topMaterials: analysis.materials
          .slice(0, 4)
          .map((m) => ({ name: m.name, category: m.category, percentage: m.percentage })),
        foodLogged,
        result: analysis,
      });
      refreshHistory();
    } catch {
      /* persistence is best-effort; never break the analysis flow */
    }
  }

  function startRun(file: File | Blob, q: string, preview: string) {
    outcome = null;
    activeRun = { file, previewUrl: preview, question: q };
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setStageIdx(0);
    setNote(null);

    const name = file instanceof File ? file.name : `capture-${Date.now()}.jpg`;
    analyzeWasteImage(file, q, name)
      .then(async (analysis) => {
        await persistRun(analysis, preview, q);
        outcome = { ok: true, data: analysis };
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Analysis failed';
        outcome = {
          ok: false,
          error: msg.includes('Failed to fetch')
            ? 'Cannot reach the backend. Start it with: cd backend && .venv\\Scripts\\python -m uvicorn app.main:app --port 8000'
            : msg,
        };
      })
      .finally(() => {
        subscribers.forEach((s) => outcome && s(outcome!));
      });
  }

  function acceptImage(fileLike: File | Blob) {
    setError(null);
    setResult(null);
    setNote(null);
    setActiveHistoryId(null);
    setImageFile(fileLike);
    setPreviewUrl(URL.createObjectURL(fileLike));
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG or PNG).');
      return;
    }
    acceptImage(file);
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCameraError(
        'Could not access the webcam. Grant browser/webview camera permission or upload a photo instead.',
      );
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) acceptImage(blob);
        stopCamera();
      },
      'image/jpeg',
      0.92,
    );
  }

  function runAnalysis() {
    if (!imageFile || !previewUrl) return;
    startRun(imageFile, question, previewUrl);
  }

  function openHistoryItem(item: WasteHistoryItem) {
    stopCamera();
    setImageFile(null);
    setAnalyzing(false);
    setError(null);
    setNote(null);
    setQuestion(item.question ?? '');
    setPreviewUrl(item.thumb);
    setResult(item.result);
    setActiveHistoryId(item.id);
  }

  function deleteHistoryItem(id: string) {
    store.removeWasteHistory(id);
    refreshHistory();
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setResult(null);
      setPreviewUrl(null);
    }
  }

  function reset() {
    activeRun = null;
    outcome = null;
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setQuestion('');
    setNote(null);
    setActiveHistoryId(null);
  }

  const activeItem = history.find((h) => h.id === activeHistoryId) ?? null;
  const activeFoodGrams = activeItem?.foodLogged && result ? estimateFoodGrams(result) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-white" />
            </div>
            AI Waste Analyzer
          </h1>
          <p className="text-sm text-dark-200 mt-1.5 max-w-2xl">
            Snap or upload a photo of any garbage pile. The AI identifies every material, its
            percentage share, harmfulness &amp; toxins — plus uses, eco-alternatives and exactly
            where each item can go. Every scan is saved to history automatically.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0 ${
            aiStatus?.ai_configured
              ? 'bg-success/10 border-success/30 text-success'
              : aiStatus === null
                ? 'bg-error/10 border-error/30 text-error'
                : 'bg-warning/10 border-warning/30 text-warning'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${aiStatus?.ai_configured ? 'bg-success' : aiStatus === null ? 'bg-error' : 'bg-warning animate-pulse'}`} />
          {aiStatus?.ai_configured
            ? `${aiStatus.provider} · ${aiStatus.model}`
            : aiStatus === null
              ? 'Backend offline'
              : 'API key not configured'}
        </span>
      </div>

      {/* Recent scans */}
      {history.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-dark-100 mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary" /> Recent scans
            <span className="font-normal text-dark-300">· {history.length} saved</span>
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => openHistoryItem(h)}
                className={`relative shrink-0 w-40 card p-2 cursor-pointer transition-all hover:border-primary/50 ${
                  activeHistoryId === h.id ? 'border-primary/70 ring-1 ring-primary/40' : ''
                }`}
              >
                <img src={h.thumb} alt="" className="w-full h-20 object-cover rounded-lg bg-black" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(h.id);
                  }}
                  title="Delete scan"
                  className="absolute top-3 right-3 p-1 rounded-md bg-black/60 text-white/80 hover:text-error hover:bg-black/80 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <p className="text-[11px] text-dark-200 mt-1.5 leading-snug line-clamp-2">{h.summary}</p>
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  <span className={`inline-flex items-center gap-1 ${HAZARD_TEXT[h.hazardLevel]} capitalize`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${HAZARD_DOT[h.hazardLevel]}`} />
                    {h.hazardLevel}
                  </span>
                  <span className="text-dark-300">{relTime(h.ts)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="card-elevated p-5">
        {cameraOn ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[420px] mx-auto w-full">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={capturePhoto} className="btn-primary inline-flex items-center gap-2">
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
              <button onClick={stopCamera} className="btn-outline inline-flex items-center gap-2 !border-error/60 !text-error hover:!bg-error/10">
                <X className="w-4 h-4" /> Stop Camera
              </button>
            </div>
          </div>
        ) : previewUrl && imageFile ? (
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative rounded-xl overflow-hidden border border-dark-400 md:w-[46%] shrink-0">
              <img src={previewUrl} alt="Garbage to analyze" className="w-full h-auto max-h-[340px] object-contain bg-black" />
              {!analyzing && (
                <button
                  onClick={() => setImageFile(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark-300 mb-1.5">
                  Ask something specific (optional)
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={analyzing}
                  rows={3}
                  placeholder='e.g. "Is this safe to touch? How do I segregate it for my municipal pickup?"'
                  className="w-full resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={runAnalysis} disabled={analyzing} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Analyzing…' : 'Analyze Waste'}
                </button>
                <button onClick={() => fileInputRef.current?.click()} disabled={analyzing} className="btn-outline inline-flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" /> Different photo
                </button>
              </div>
              {analyzing && (
                <div className="rounded-lg bg-dark-700 border border-dark-500 p-3.5">
                  <p className="text-sm text-primary-light flex items-center gap-2 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> {ANALYSIS_STAGES[stageIdx]}
                  </p>
                  <div className="mt-3 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${((stageIdx + 1) / ANALYSIS_STAGES.length) * 88}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-dark-300 mt-2">
                    Deep vision analysis usually takes 10–40 seconds. You can safely browse other
                    pages — results appear here when you return.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-dark-400">
            <img src={previewUrl} alt="Saved scan" className="w-full max-h-[340px] object-contain bg-black mx-auto" />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Viewing a saved scan
            </div>
            <button
              onClick={reset}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-dark-400 hover:border-primary/50 hover:bg-dark-600/40'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold text-dark-50">Drop a garbage photo here, or click to browse</p>
              <p className="text-xs text-dark-300 mt-1">JPG or PNG · up to 10 MB</p>
            </div>
            <div className="flex justify-center">
              <button onClick={startCamera} className="btn-secondary inline-flex items-center gap-2">
                <Camera className="w-4 h-4" /> Capture with Webcam
              </button>
            </div>
            {cameraError && <p className="text-sm text-warning text-center">{cameraError}</p>}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 p-3.5 text-sm text-red-300 whitespace-pre-wrap">{error}</div>
        )}
      </div>

      {/* Notes */}
      {note && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3 text-sm text-primary-light flex items-center gap-2">
          <History className="w-4 h-4 shrink-0" /> {note}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {activeItem?.foodLogged && (
            <div className="rounded-lg border border-success/30 bg-success/10 p-3.5 text-sm flex items-start gap-2.5">
              <UtensilsCrossed className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span className="text-success">
                Organic content detected (~{activeFoodGrams} g) — automatically added to your{' '}
                <strong>Food Waste Tracker</strong> log.
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark-50">Results</h2>
            <button onClick={reset} className="btn-ghost inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> New analysis
            </button>
          </div>
          <AnalysisResults result={result} />
        </>
      )}
    </div>
  );
}
