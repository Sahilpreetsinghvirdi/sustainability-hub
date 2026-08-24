import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, Trash2, TrendingUp, TrendingDown, Flame, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { store, lastNDayLabels } from '../lib/store';
import { useChartChrome } from '../lib/chartColors';

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
    value: Math.round((logs.filter((l) => l.date === d.iso).reduce((s, l) => s + l.amount, 0) / 1000) * 100) / 100,
  }));
}

function StatCard({ icon: Icon, label, value, unit, trend, trendUp, color, path }: any) {
  const navigate = useNavigate();
  return (
    <div onClick={() => path && navigate(path)} className={`card-elevated flex items-start justify-between ${path ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}>
      <div>
        <p className="text-dark-200 text-xs font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-dark-50">{value}</span>
          <span className="text-sm text-dark-300">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-error' : 'text-primary'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend} vs last month
        </div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className={`w-5 h-5 ${color.includes('primary') || color.includes('accent') ? 'on-primary-chip' : 'text-white'}`} />
      </div>
    </div>
  );
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
          <XAxis dataKey={xKey} stroke={chrome.axis} fontSize={11} />
          <YAxis stroke={chrome.axis} fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8, fontSize: 12, color: chrome.tooltipText }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey}-${color.replace('#', '')})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // Re-read persisted store on mount and whenever storage changes elsewhere
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    const i = setInterval(onStorage, 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(i);
    };
  }, []);

  const dashData = store.getDashboardData();
  const carbonData = weeklyCarbon();
  const energyData = monthlyEnergy();
  const wasteData = dailyWaste();

  const actions = [
    { label: 'Scan Receipt', icon: Leaf, color: 'bg-primary', desc: 'Log a carbon footprint', path: '/carbon' },
    { label: 'Log Energy Bill', icon: Zap, color: 'bg-warning', desc: 'Track energy usage', path: '/energy' },
    { label: 'Log Food Waste', icon: Trash2, color: 'bg-error', desc: 'Record wasted food', path: '/food-waste' },
    { label: 'View Audit', icon: Target, color: 'bg-secondary', desc: 'Energy efficiency tips', path: '/energy' },
  ];
  void tick;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-dark-200 text-sm mt-1">Your sustainability overview — live from your logged data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Leaf} label="Carbon Footprint" value={dashData.carbon || 0} unit="kg CO\u2082e" trend={dashData.carbonEntries > 0 ? `${dashData.carbonEntries} receipts` : 'No data yet'} trendUp={false} color="bg-primary" path="/carbon" />
        <StatCard icon={Zap} label="Energy Usage" value={dashData.energy || 0} unit="kWh" trend={dashData.energyBills > 0 ? `${dashData.energyBills} bills` : 'No data yet'} trendUp={true} color="bg-warning" path="/energy" />
        <StatCard icon={Trash2} label="Food Waste" value={dashData.wasteKg || 0} unit="kg" trend={dashData.wasteCount > 0 ? `${dashData.wasteCount} items logged` : 'No data yet'} trendUp={false} color="bg-error" path="/food-waste" />
        <StatCard icon={Flame} label="Logging Streak" value={dashData.streak} unit="days" trend={`Best: ${dashData.bestStreak}`} trendUp={false} color="bg-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniChart title="Carbon Trend · 7 weeks" data={carbonData} dataKey="value" color="#22C55E" xKey="week" />
        <MiniChart title="Energy Trend · 6 months" data={energyData} dataKey="value" color="#F59E0B" xKey="month" />
        <MiniChart title="Food Waste · this week" data={wasteData} dataKey="value" color="#EF4444" xKey="day" />
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-dark-100 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} className="card hover:border-primary/50 transition-all text-left group cursor-pointer">
              <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-4 h-4 ${action.color.includes('primary') || action.color.includes('accent') ? 'on-primary-chip' : 'text-white'}`} />
              </div>
              <p className="text-sm font-medium text-dark-50">{action.label}</p>
              <p className="text-xs text-dark-300 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {dashData.scans > 0 && (
        <div className="card flex items-center justify-between">
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
