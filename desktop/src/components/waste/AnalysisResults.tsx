import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  FlaskConical,
  Hourglass,
  Lightbulb,
  MapPin,
  Recycle,
  Repeat,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { HazardLevel, MaterialAnalysis, WasteAnalysisResponse } from '@/types';
import { useChartChrome } from '@/lib/chartColors';

export const HAZARD_STYLES: Record<HazardLevel, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Low Risk' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Medium Risk' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'High Risk' },
  critical: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/30', label: 'Critical Risk' },
};

/* One distinct color PER MATERIAL (by position), so every pie slice and its
   matching card are always visually different — even when several items share
   the same waste category (e.g. three kinds of plastic). */
const MATERIAL_COLORS = [
  '#0EA5E9', // sky
  '#F59E0B', // amber
  '#22C55E', // green
  '#A78BFA', // violet
  '#EF4444', // red
  '#14B8A6', // teal
  '#EC4899', // pink
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#EAB308', // yellow
  '#06B6D4', // cyan
];

export function colorForMaterial(index: number, _category?: string) {
  return MATERIAL_COLORS[index % MATERIAL_COLORS.length];
}

function hazardColor(level: HazardLevel) {
  return level === 'low' ? '#22C55E' : level === 'medium' ? '#F59E0B' : level === 'high' ? '#F97316' : '#EF4444';
}

/** Circular gauge showing overall harmfulness score. */
function HazardGauge({ score, level }: { score: number; level: HazardLevel }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * circ;
  const style = HAZARD_STYLES[level] ?? HAZARD_STYLES.low;
  const chrome = useChartChrome();
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={chrome.grid} strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={hazardColor(level)}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${style.text}`}>{score}</span>
        <span className={`text-[10px] font-medium uppercase tracking-wide text-center ${style.text}`}>{style.label}</span>
      </div>
    </div>
  );
}

function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'danger' | 'eco' }) {
  const tones = {
    default: 'bg-dark-600 border-dark-400 text-dark-100',
    danger: 'bg-error/10 border-error/30 text-red-300',
    eco: 'bg-primary/10 border-primary/30 text-primary-light',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SectionList({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone?: 'danger' | 'eco';
}) {
  if (!items.length) return null;
  const dot = tone === 'danger' ? 'bg-error' : tone === 'eco' ? 'bg-primary' : 'bg-dark-300';
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-dark-200 mb-2">
        {icon} {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-dark-100 flex gap-2">
            <span className={`mt-2 w-1 h-1 rounded-full shrink-0 ${dot}`} />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaterialCard({ material, index }: { material: MaterialAnalysis; index: number }) {
  const [open, setOpen] = useState(index < 2);
  const hs = HAZARD_STYLES[material.hazard.level] ?? HAZARD_STYLES.low;
  const color = colorForMaterial(index, material.category);

  return (
    <div className="card overflow-hidden !p-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-dark-600/60 transition-colors"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
        >
          <span className="text-sm font-bold" style={{ color }}>
            {material.percentage.toFixed(0)}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-dark-50">{material.name}</h4>
            <span className="px-2 py-0.5 rounded-md bg-dark-700 border border-dark-400 text-xs text-dark-200 capitalize">
              {material.category.replace('_', '-')}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${hs.bg} ${hs.text} ${hs.border}`}>
              {material.hazard.level !== 'low' ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {hs.label} · {material.hazard.score}/100
            </span>
            <span className="text-xs text-dark-200">Confidence {(material.confidence * 100).toFixed(0)}%</span>
            {material.disposal.recyclable && (
              <span className="inline-flex items-center gap-1 text-xs text-primary-light">
                <Recycle className="w-3.5 h-3.5" /> Recyclable
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-dark-200 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-dark-500 p-4 space-y-4">
          {material.description && <p className="text-sm text-dark-100 leading-relaxed">{material.description}</p>}

          <div>
            <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, material.percentage)}%`, backgroundColor: color }} />
            </div>
            <p className="text-[11px] text-dark-300 mt-1">{material.percentage.toFixed(1)}% of pile composition</p>
          </div>

          {material.hazard.toxins.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-dark-200 mb-2">
                <FlaskConical className="w-4 h-4 text-orange-400" /> Toxins &amp; Harmful Compounds
              </p>
              <div className="flex flex-wrap gap-1.5">
                {material.hazard.toxins.map((t, i) => (
                  <Chip key={i} tone="danger">
                    <Skull className="w-3 h-3" />
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <SectionList icon={<AlertTriangle className="w-4 h-4 text-warning" />} title="Health Risks" items={material.hazard.health_risks} tone="danger" />
            <SectionList icon={<Lightbulb className="w-4 h-4 text-accent-light" />} title="Common Uses" items={material.common_uses} />
          </div>

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <SectionList icon={<Repeat className="w-4 h-4 text-secondary" />} title="Reuse / Upcycle Ideas" items={material.reuse_ideas} tone="eco" />
            <SectionList icon={<Recycle className="w-4 h-4 text-primary" />} title="Eco-Friendly Alternatives" items={material.eco_alternatives} tone="eco" />
          </div>

          <div className={`rounded-lg border ${hs.border} ${hs.bg} p-3 space-y-1`}>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1 ${hs.text}">
              <MapPin className={`w-4 h-4 ${hs.text}`} />
              <span className={hs.text}>Disposal &amp; Where It Can Go</span>
            </p>
            <p className="text-sm text-dark-50">
              <span className="text-dark-300">Method: </span>
              {material.disposal.method}
            </p>
            <p className="text-sm text-dark-50">
              <span className="text-dark-300">Destination: </span>
              {material.disposal.destination}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompositionChart({ materials }: { materials: MaterialAnalysis[] }) {
  const chrome = useChartChrome();
  const sorted = [...materials].sort((a, b) => b.percentage - a.percentage);
  const data = sorted.map((m, i) => ({
    name: m.name.length > 22 ? `${m.name.slice(0, 20)}…` : m.name,
    value: Number(m.percentage.toFixed(1)),
    color: colorForMaterial(i, m.category),
  }));
  const pieLabel = {
    fill: chrome.axis,
    fontSize: 11,
    fontWeight: 600,
    formatter: (value: number | string) => `${value}%`,
  } as never;
  return (
    <div className="card h-[320px]">
      <h3 className="text-sm font-semibold text-dark-100 mb-1">Material Composition</h3>
      <p className="text-xs text-dark-300 mb-2">Share of pile by visible mass / volume</p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={2}
            label={pieLabel}
            labelLine={false}
          >
            {data.map((d, i) => (
              <Cell key={`${d.name}-${i}`} fill={d.color} stroke={chrome.surface} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8, color: chrome.tooltipText }}
            formatter={(value: number | string) => [`${value}%`, 'Share']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: chrome.legend }} iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalysisResults({ result }: { result: WasteAnalysisResponse }) {
  const hs = HAZARD_STYLES[result.overall_hazard.level] ?? HAZARD_STYLES.low;

  return (
    <div className="space-y-5 animate-[fadeIn_.4s_ease]">
      {/* Summary + overall hazard */}
      <div className={`card-elevated border ${hs.border}`}>
        <div className="flex items-start gap-5">
          <HazardGauge score={result.overall_hazard.score} level={result.overall_hazard.level} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-bold text-dark-50">Analysis Complete</h3>
              {result.estimated_decomposition && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-700 border border-dark-400 text-xs text-dark-200">
                  <Hourglass className="w-3 h-3" /> Longest-lived: {result.estimated_decomposition}
                </span>
              )}
            </div>
            <p className="text-sm text-dark-100 leading-relaxed">{result.summary}</p>

            {(result.overall_hazard.toxins.length > 0 || result.overall_hazard.health_risks.length > 0) && (
              <div className="mt-3 space-y-2">
                {result.overall_hazard.toxins.length > 0 && (
                  <p className="text-sm text-dark-200">
                    <span className={`font-semibold ${hs.text}`}>Key toxins in this pile: </span>
                    <span className="text-dark-100">{result.overall_hazard.toxins.join(', ')}</span>
                  </p>
                )}
                {result.overall_hazard.health_risks.length > 0 && (
                  <p className="text-sm text-dark-200">
                    <span className={`font-semibold ${hs.text}`}>Main health concerns: </span>
                    <span className="text-dark-100">{result.overall_hazard.health_risks.slice(0, 3).join(' · ')}</span>
                  </p>
                )}
              </div>
            )}
            <p className="mt-2 text-[11px] text-dark-300">
              Analyzed by {result.analyzer_model || 'AI vision'} · {result.materials.length} material
              {result.materials.length === 1 ? '' : 's'} detected · {(result.processing_time_ms / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <CompositionChart materials={result.materials} />

        {/* Recommendations */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-dark-100 mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" /> What You Should Do
          </h3>
          <ul className="space-y-2.5">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-dark-100">
                <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Per-material breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-dark-100 mb-3">Material-by-Material Breakdown</h3>
        <div className="space-y-3">
          {result.materials.map((m, i) => (
            <MaterialCard key={`${m.name}-${i}`} material={m} index={i} />
          ))}
        </div>
      </div>

      {/* Environmental impact */}
      {result.environmental_impact && (
        <div className="card border-warning/25 bg-warning/5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-warning mb-2">
            <AlertTriangle className="w-4 h-4" /> Environmental Impact If Not Managed
          </h3>
          <p className="text-sm text-dark-100 leading-relaxed">{result.environmental_impact}</p>
        </div>
      )}
    </div>
  );
}
