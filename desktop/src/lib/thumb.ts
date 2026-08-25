async function loadOrientedBitmap(src: string): Promise<{ bmp: ImageBitmap | null; img: HTMLImageElement | null; w: number; h: number }> {
  // Try createImageBitmap with orientation handling (corrects EXIF rotation)
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    if ('createImageBitmap' in window) {
      const bmp = await (createImageBitmap as any)(blob, { imageOrientation: 'from-image' });
      return { bmp, img: null, w: bmp.width, h: bmp.height };
    }
  } catch { /* fall through */ }
  // Fallback: plain Image (browser will handle orientation on display, but canvas draw may be unrotated)
  const img = new Image();
  img.decoding = 'async' as any;
  // @ts-ignore — hint for EXIF auto-rotate where supported
  if ('imageOrientation' in img.style) (img.style as any).imageOrientation = 'from-image';
  const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  await (loaded as any).decode?.().catch(() => {});
  return { bmp: null, img: loaded, w: loaded.naturalWidth || loaded.width, h: loaded.naturalHeight || loaded.height };
}

function drawToDataUrl(
  bmp: ImageBitmap | null,
  img: HTMLImageElement | null,
  w: number,
  h: number,
  maxSide: number,
  quality: number,
): string {
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no ctx');
  // High-quality downscale
  (ctx as any).imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = 'high';
  if (bmp) ctx.drawImage(bmp, 0, 0, cw, ch);
  else if (img) ctx.drawImage(img, 0, 0, cw, ch);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function makeThumb(src: string): Promise<string> {
  const { bmp, img, w, h } = await loadOrientedBitmap(src);
  try { return drawToDataUrl(bmp, img, w, h, 260, 0.72); }
  finally { bmp?.close?.(); }
}

export async function makeFullImage(src: string): Promise<string> {
  const { bmp, img, w, h } = await loadOrientedBitmap(src);
  try { return drawToDataUrl(bmp, img, w, h, 1600, 0.92); }
  finally { bmp?.close?.(); }
}

export function relTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
