import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';

export interface PaletteItem {
  label: string;
  hint?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(needle) ||
        (i.hint || '').toLowerCase().includes(needle),
    );
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
    }
  }, [open ]);

  useEffect(() => {
    setIdx(0);
  }, [q ]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const go = (it: PaletteItem) => {
    onClose();
    navigate(it.path);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[16vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-dark-700 shadow-2xl animate-pageIn">
        <div className="flex items-center gap-2.5 px-4 border-b border-dark-500/60">
          <Search className="w-4 h-4 text-dark-300 shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIdx((v) => Math.min(v + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIdx((v) => Math.max(v - 1, 0));
              } else if (e.key === 'Enter' && filtered[idx]) {
                go(filtered[idx]);
              }
            }}
            placeholder="Jump to a page or action…"
            className="w-full bg-transparent !border-0 !shadow-none !outline-none !ring-0 py-3.5 text-sm text-dark-50 placeholder:text-dark-300 px-0"
          />
          <kbd className="shrink-0 text-[10px] font-mono rounded-md bg-dark-600 px-1.5 py-0.5 text-dark-300">esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-dark-300">No matches for “{q}”.</p>
          )}
          {filtered.map((it, i) => (
            <button
              key={`${it.path}-${it.label}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => go(it)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                i === idx ? 'bg-primary/15 text-dark-50' : 'text-dark-200'
              }`}
            >
              <it.icon className={`w-4 h-4 shrink-0 ${i === idx ? 'text-primary' : 'text-dark-300'}`} />
              <span className="flex-1 text-sm font-medium truncate">{it.label}</span>
              {it.hint && <span className="text-[11px] text-dark-300 truncate">{it.hint}</span>}
              {i === idx && <CornerDownLeft className="w-3.5 h-3.5 text-dark-300 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
