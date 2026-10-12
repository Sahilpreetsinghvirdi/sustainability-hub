import { useEffect, useState } from 'react';
import { Rocket, Download, ExternalLink, X, Loader2 } from 'lucide-react';
import { checkForUpdate, downloadUpdate, CURRENT_VERSION, type UpdateInfo } from '../lib/updater';

/** Eye-catching gradient banner shown on the Dashboard when a newer GitHub release exists. */
export default function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    checkForUpdate().then((r) => {
      if (live && r?.hasUpdate) setInfo(r);
    });
    return () => {
      live = false;
    };
  }, []);

  if (dismissed || !info) return null;

  const onDownload = async () => {
    if (!info.downloadUrl) {
      window.open(info.url, '_blank', 'noreferrer');
      return;
    }
    setBusy(true);
    try {
      await downloadUpdate(info.downloadUrl);
    } finally {
      setTimeout(() => setBusy(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent p-4 sm:p-5 animate-pageIn">
      <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-lg shadow-black/40">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-dark-50 flex items-center gap-2 flex-wrap">
            ELARA {info.latest} is here
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wide animate-pulse">
              New
            </span>
          </p>
          <p className="text-xs text-dark-200 mt-0.5">
            You're on v{CURRENT_VERSION} — one click to grab the latest build from GitHub.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={onDownload}
            disabled={busy}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {busy ? 'Starting…' : 'Update'}
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
