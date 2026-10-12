import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Zap, Trash2, Flame, ScanSearch,
  Receipt, PlugZap, UtensilsCrossed, Sparkles, ArrowUpRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { store, lastNDayLabels } from '../lib/store';
import { useChartChrome } from '../lib/chartColors';
import { getCurrentUser } from '../lib/auth';
import { relTime } from '../lib/thumb';
import UpdateBanner from '../components/UpdateBanner';

function weeklyCarbon(): { week: string; value: number }[] {
  const entries = store.getCarbon();
  const out: { week: string; value: number }[] = [];
  for (let w = 6; w >= 0; w--) {
    const start = new Date();
    start.setDate(start.getDate() - (w * 7 + 6));
    const end = new Date();
    end.setDate(end.getDate() - w * 7);
    const s = start.toISOString().split('T')[0];
    const e = end.toISOString().split('T')[0];
    const v = entries.filter((c) => c.date >= s && c.date <= e).reduce((sum, c) => sum + c.totalCarbon, 0);
    out.push({ week: `W${7 - w}`, value: Math.round(v * 10) / 10 });
  }
  return out;
}

function monthlyEnergy(): { month: string; value: number }[] {
  const bills = store.getEnergy();
  const out: { month: string; value: number }[] = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const key = d.toISOString().slice(0, 7);
    const v = bills.filter((b) => b.period.slice(0, 7) === key).reduce((s, b) => s + b.electricity, 0);
    out.push({ month: d.toLocaleString('en', { month: 'short' }), value: Math.round(v) });
  }
  return out;
}

function dailyWaste(): { day: string; value: number }[] {
  const logs = store.getWaste();
  return lastNDayLabels(7).map((d) => ({
    day: d.label,
    value: Math.round((logs.filter((l) => l.date === d.iso).reduce((s, l) => l.amount, 0) / 1000) * 100) / 100,
  }));
}

function MiniChart({ title, data, dataKey, color, xKey }: { title: string; data: any[]; dataKey: string; color: string; xKey: string }) {
  const chrome = useChartChrome();
  const hasAny = data.some((d) => (d[dataKey] ?? 0) > 0);
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-100 mb-3">{title}{!hasAny && <span className="ml-2 text-xs font-normal text-dark-300">no data yet</span>}</h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} />
          <XAxis dataKey={xKey} tick={{ fill: chrome.legend, fontSize: 11 }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
          <YAxis tick={{ fill: chrome.legend, fontSize: 11 }} axisLine={{ stroke: chrome.axis }} tickLine={false} width={28} />
          <Tooltip contentStyle={{ backgroundColor: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 12, fontSize: 12, color: chrome.tooltipText }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey}-${color.replace('#', '')})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StreakCard({ streak, best }: { streak: number; best: number }) {
  const R = 40;
  const C = 2 * Math.PI * R;
  const pct = Math.min(streak / 30, 1);
  return (
    <div className="card flex flex-col items-center justify-center text-center gap-1 py-6 h-full">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
          <circle cx="48" cy="48" r={R} fill="none" strokeWidth="9" className="stroke-dark-600" />
          <circle
            cx="48" cy="48" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
            stroke="#F97316" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-display text-xl font-bold text-dark-50 leading-none mt-0.5">{streak}</span>
        </div>
      </div>
      <p className="text-sm font-bold text-dark-50 mt-2">day streak</p>
      <p className="text-xs text-dark-300">Best: {best} days · log daily to grow it</p>
    </div>
  );
}

interface FeedItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  chip: string;
  title: string;
  meta: string;
  ts: string;
  path: string;
}

function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];
  for (const c of store.getCarbon()) {
    items.push({
      id: `c${c.id}`, icon: Receipt, chip: 'bg-primary/15 text-primary',
      title: `${c.store || 'Receipt'} — ${c.totalCarbon.toFixed(1)} kg CO₂e`,
      meta: `${c.items.length} items`, ts: c.date, path: '/carbon',
    });
  }
  for (const b of store.getEnergy()) {
    items.push({
      id: `e${b.id}`, icon: PlugZap, chip: 'bg-warning/15 text-warning',
      title: `${b.provider || 'Energy bill'} — ${b.electricity} kWh`,
      meta: b.period, ts: b.period.length === 7 ? `${b.period}-01` : b.period, path: '/energy',
    });
  }
  for (const w of store.getWaste()) {
    items.push({
      id: `w${w.id}`, icon: UtensilsCrossed, chip: 'bg-error/15 text-error',
      title: `${w.meal} — ${(w.amount / 1000).toFixed(2)} kg`,
      meta: w.desc || w.reason, ts: w.date, path: '/food-waste',
    });
  }
  items.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return items.slice(0, 6);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    const i = setInterval(onStorage, 4000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(i);
    };
  }, []);

  const dashData = store.getDashboardData();
  const carbonData = weeklyCarbon();
  const energyData = monthlyEnergy();
  const wasteData = dailyWaste();
  const feed = buildFeed();

  const hour = new Date().getHours();
  const dayPart = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const who = ((getCurrentUser() as any)?.name || (store.getProfile() as any)?.name || '').trim().split(/\s+/)[0];
  const hello = who ? `Good ${dayPart}, ${who}.` : `Good ${dayPart}.`;

  const stats = [
    { icon: Leaf, chip: 'bg-primary/15 text-primary', value: dashData.carbon || 0, unit: 'kg CO₂e', label: 'Carbon footprint', sub: dashData.carbonEntries > 0 ? `${dashData.carbonEntries} receipts` : 'No data yet', path: '/carbon' },
    { icon: Zap, chip: 'bg-warning/15 text-warning', value: dashData.energy || 0, unit: 'kWh', label: 'Energy usage', sub: dashData.energyBills > 0 ? `${dashData.energyBills} bills` : 'No data yet', path: '/energy' },
    { icon: Trash2, chip: 'bg-error/15 text-error', value: dashData.wasteKg || 0, unit: 'kg', label: 'Food waste', sub: dashData.wasteCount > 0 ? `${dashData.wasteCount} items logged` : 'No data yet', path: '/food-waste' },
    { icon: Flame, chip: 'bg-orange-500/15 text-orange-500', value: dashData.streak, unit: 'days', label: 'Logging streak', sub: `Best: ${dashData.bestStreak}`, path: '/food-waste' },
  ];

  const quick = [
    { icon: Receipt, label: 'Scan receipt', desc: 'Carbon footprint', path: '/carbon' },
    { icon: PlugZap, label: 'Log energy bill', desc: 'Track usage', path: '/energy' },
    { icon: UtensilsCrossed, label: 'Log food waste', desc: 'Cut waste', path: '/food-waste' },
    { icon: ScanSearch, label: 'Open analyzer', desc: 'AI scans', path: '/analyzer' },
  ];

  void tick;
  return (
    <div className="space-y-5 max-w-6xl mx-auto w-full">
      <UpdateBanner />

      {/* Headline row */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Elara home
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-dark-50 mt-1.5">{hello}</h1>
          <p className="text-sm text-dark-200 mt-1.5">Here's your planet, at a glance.</p>
        </div>
        <div className="shrink-0 flex flex-wrap gap-2.5">
          <button onClick={() => navigate('/analyzer')} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5">
            <ScanSearch className="w-4 h-4" /> Scan waste now
          </button>
          <button onClick={() => navigate('/food-waste')} className="btn-outline inline-flex items-center gap-2 px-5 py-2.5">
            Log food waste
          </button>
        </div>
      </div>

      {/* Bento row 1 — streak + scan card (swapped sides) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <StreakCard streak={dashData.streak} best={dashData.bestStreak} />
        </div>
        <div className="md:col-span-4 card">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">AI waste analyzer — Elara's superpower</p>
            <h2 className="font-display text-2xl font-bold text-dark-50 mt-2">What are you throwing today?</h2>
            <p className="text-sm text-dark-200 mt-1.5 max-w-lg leading-relaxed">
              Point your camera at any waste — ELARA breaks down materials, toxins and exactly what to do with them.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Materials %', 'Toxins', 'Recyclers', 'Eco swaps'].map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full bg-dark-600 text-[11px] font-medium text-dark-100">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">
          {stats.map((s) => (
            <button key={s.label} onClick={() => navigate(s.path)} className="flex items-center gap-3 text-left rounded-xl p-1 hover:bg-dark-600/50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.chip}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-bold text-dark-50">{s.value}</span>
                  <span className="text-xs text-dark-300">{s.unit}</span>
                </div>
                <p className="text-xs font-medium text-dark-100 truncate">{s.label}</p>
                <p className="text-[11px] text-dark-300 truncate">{s.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bento row 2 — activity + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="card lg:col-span-4">
          <h3 className="text-sm font-semibold text-dark-100 mb-3">Recent activity</h3>
          {feed.length === 0 ? (
            <div className="rounded-2xl bg-dark-600/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-dark-100">Nothing logged yet</p>
              <p className="text-xs text-dark-300 mt-1">Scan your first waste above and it will show up here.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {feed.map((f) => (
                <button
                  key={f.id}
                  onClick={() => navigate(f.path)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-dark-600/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.chip}`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-dark-50 truncate">{f.title}</p>
                    <p className="text-[11px] text-dark-300 truncate">{f.meta}</p>
                  </div>
                  <span className="text-[11px] text-dark-300 shrink-0">{relTime(f.ts)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-dark-100 mb-2">Quick actions</h3>
          <div className="flex flex-col">
            {quick.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-dark-600/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark-50">{a.label}</p>
                  <p className="text-[11px] text-dark-300">{a.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-dark-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniChart title="Carbon Trend · 7 weeks" data={carbonData} dataKey="value" color="#22C55E" xKey="week" />
        <MiniChart title="Energy Trend · 6 months" data={energyData} dataKey="value" color="#F59E0B" xKey="month" />
        <MiniChart title="Food Waste · this week" data={wasteData} dataKey="value" color="#EF4444" xKey="day" />
      </div>

      {dashData.scans > 0 && (
        <div className="card flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-dark-50">{dashData.scans} AI waste scan{dashData.scans === 1 ? '' : 's'} in history</p>
            <p className="text-xs text-dark-300 mt-0.5">Organic portions are auto-linked into Food Waste</p>
          </div>
          <button onClick={() => navigate('/analyzer')} className="btn-outline text-sm inline-flex items-center gap-2"><Trash2 className="w-4 h-4" /> Open Analyzer</button>
        </div>
      )}
    </div>
  );
}
