import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  ScanSearch,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import type { WasteAnalysisResponse } from '@/types';
import { analyzeWasteImage, fetchAnalyzerStatus } from '@/lib/api';
import AnalysisResults from '@/components/waste/AnalysisResults';

const ANALYSIS_STAGES = [
  'Uploading image to AI…',
  'Identifying materials in the photo…',
  'Estimating composition percentages…',
  'Assessing toxins & harmfulness…',
  'Preparing uses, alternatives & disposal guidance…',
];

type AiStatus = { ai_configured: boolean; provider: string | null; model: string };

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check backend / AI availability once on mount
  useEffect(() => {
    fetchAnalyzerStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus(null));
  }, []);

  // Rotate the fake-but-informative progress stages while analyzing
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

  function acceptImage(fileLike: File | Blob) {
    setError(null);
    setResult(null);
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
    } catch (e) {
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

  async function runAnalysis() {
    if (!imageFile) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setStageIdx(0);
    try {
      const name =
        imageFile instanceof File ? imageFile.name : `capture-${Date.now()}.jpg`;
      const analysis = await analyzeWasteImage(imageFile, question, name);
      setResult(analysis);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setError(
        msg.includes('Failed to fetch')
          ? 'Cannot reach the backend. Start it with: cd backend && .venv\\Scripts\\python -m uvicorn app.main:app --port 8000'
          : msg,
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setQuestion('');
  }

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
            where each item can go.
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
        ) : previewUrl ? (
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative rounded-xl overflow-hidden border border-dark-400 md:w-[46%] shrink-0">
              <img src={previewUrl} alt="Garbage to analyze" className="w-full h-auto max-h-[340px] object-contain bg-black" />
              {!analyzing && (
                <button
                  onClick={reset}
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
                  <p className="text-[11px] text-dark-300 mt-2">Deep vision analysis usually takes 10–40 seconds.</p>
                </div>
              )}
            </div>
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

      {/* Results */}
      {result && (
        <>
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
