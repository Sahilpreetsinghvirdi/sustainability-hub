const OWNER = 'Sahilpreetsinghvirdi';
const REPO = 'sustainability-hub';
const CURRENT = '1.5.2';

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
    // Find Windows MSI asset for one-click download
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

export async function downloadUpdate(downloadUrl: string) {
  // Works in both web and Tauri webview — triggers browser download
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = '';
  a.target = '_blank';
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Also try Tauri shell open as fallback for installed app
  try {
    const mod: any = await import('@tauri-apps/plugin-shell').catch(() => null);
    if (mod?.open) await mod.open(downloadUrl);
  } catch {}
}

export const CURRENT_VERSION = CURRENT;
