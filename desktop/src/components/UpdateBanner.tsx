import { useEffect, useState, useCallback } from 'react';
import { Rocket, Download, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { checkForUpdate, downloadUpdate, CURRENT_VERSION, type UpdateInfo, type DownloadProgress } from '../lib/updater';

/* ── circular progress ring ─────────────────────────────────────── */
function ProgressRing({ fraction }: { fraction: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const pct = Math.round(fraction * 100);
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="3.5" className="stroke-dark-600" />
        <circle
          cx="22" cy="22" r={r} fill="none" strokeWidth="3.5"
          stroke="currentColor" className="text-primary"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - fraction)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums text-dark-50">
        {pct}%
      </span>
    </div>
  );
}

/* ── banner ─────────────────────────────────────────────────────── */
export default function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    checkForUpdate().then((r) => {
      if (live && r?.hasUpdate) setInfo(r);
    });
    return () => { live = false; };
  }, []);

  const onDownload = useCallback(async () => {
    if (!info?.downloadUrl) {
      window.open(info?.url, '_blank', 'noreferrer');
      return;
    }
    setError(null);
    try {
      await downloadUpdate(info.downloadUrl, setProgress);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.');
      setProgress(null);
    }
  }, [info]);

  if (dismissed || !info) return null;

  /* ── downloading state ── */
  if (progress && !done) {
    return (
      <div className="card animate-pageIn">
        <div className="flex items-center gap-4 min-w-0">
          <ProgressRing fraction={progress.fraction} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-dark-50">Downloading ELARA {info.latest}…</p>
            <p className="text-xs text-dark-200 mt-0.5 tabular-nums">
              {(progress.loaded / 1048576).toFixed(1)} MB
              {progress.total > 0 && <> / {(progress.total / 1048576).toFixed(1)} MB</>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── done state ── */
  if (done) {
    return (
      <div className="card animate-pageIn">
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-dark-50">Installer launched</p>
            <p className="text-xs text-dark-200 mt-0.5">
              Follow the setup wizard to finish updating to {info.latest}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-pageIn">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-dark-50 flex items-center gap-2 flex-wrap">
            ELARA {info.latest} is here
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wide animate-pulse">
              New
            </span>
          </p>
          {error ? (
            <p className="text-xs text-red-400 mt-0.5">{error}</p>
          ) : (
            <p className="text-xs text-dark-200 mt-0.5">
              You're on v{CURRENT_VERSION} — one click to download &amp; install.
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={onDownload}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Update
          </button>
          <button
            onClick={() => window.open(info.url, '_blank', 'noreferrer')}
            className="btn-outline hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm"
            title="See what's new in this release"
          >
            <ExternalLink className="w-4 h-4" /> What's new
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-md hover:bg-dark-600 text-dark-300 hover:text-dark-50 transition-colors"
            title="Dismiss for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
