const OWNER = 'Sahilpreetsinghvirdi';
const REPO = 'sustainability-hub';
const CURRENT = '1.6.1';

function cmp(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export interface UpdateInfo {
  latest: string;
  url: string;
  downloadUrl: string | null;
  hasUpdate: boolean;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const j = await res.json();
    const latest: string = j.tag_name || j.name || '';
    if (!latest) return null;
    const assets: any[] = j.assets || [];
    const msi = assets.find((a: any) => a.name?.toLowerCase().endsWith('.msi')) || assets.find((a: any) => a.name?.toLowerCase().endsWith('.exe'));
    return {
      latest,
      url: j.html_url || `https://github.com/${OWNER}/${REPO}/releases/tag/${latest}`,
      downloadUrl: msi?.browser_download_url || null,
      hasUpdate: cmp(latest, CURRENT) > 0,
    };
  } catch {
    return null;
  }
}

export type DownloadProgress = { loaded: number; total: number; fraction: number };

/**
 * Downloads the MSI with real-time progress, then invokes the Tauri
 * `install_update` command to save it to a temp file and launch msiexec.
 * Falls back to a plain browser download when running outside Tauri.
 */
export async function downloadUpdate(
  downloadUrl: string,
  onProgress?: (p: DownloadProgress) => void,
): Promise<void> {
  const res = await fetch(downloadUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const total = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('Streaming not supported in this environment.');

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.({ loaded, total, fraction: total > 0 ? loaded / total : 0 });
  }

  const allBytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    allBytes.set(chunk, offset);
    offset += chunk.length;
  }

  // Tauri installed app — hand bytes to Rust to write + launch msiexec
  const tauri = (window as any).__TAURI__;
  if (tauri?.core?.invoke) {
    await tauri.core.invoke('install_update', { bytes: Array.from(allBytes) });
    return;
  }

  // Browser fallback — trigger a file download
  const blob = new Blob([allBytes], { type: 'application/x-msi' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ELARA-update.msi`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export const CURRENT_VERSION = CURRENT;

const LAST_CHECK_KEY = 'sh_update_lastcheck';

export function getLastCheckISO(): string | null {
  try {
    return localStorage.getItem(LAST_CHECK_KEY);
  } catch {
    return null;
  }
}

/** Same as checkForUpdate but records when the check happened (even on failure). */
export async function refreshUpdateCheck(): Promise<UpdateInfo | null> {
  const info = await checkForUpdate();
  try {
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  } catch {}
  return info;
}
