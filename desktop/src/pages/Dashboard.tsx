import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, Trash2, TrendingUp, TrendingDown, Flame, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { store } from '../lib/store';

const carbonData = [
  { week: 'W1', value: 42 }, { week: 'W2', value: 38 }, { week: 'W3', value: 35 },
  { week: 'W4', value: 40 }, { week: 'W5', value: 33 }, { week: 'W6', value: 31 }, { week: 'W7', value: 29 },
];

const energyData = [
  { month: 'Jan', value: 420 }, { month: 'Feb', value: 395 }, { month: 'Mar', value: 410 },
  { month: 'Apr', value: 380 }, { month: 'May', value: 365 }, { month: 'Jun', value: 350 },
];

const wasteData = [
  { day: 'Mon', value: 0.8 }, { day: 'Tue', value: 0.5 }, { day: 'Wed', value: 0.3 },
  { day: 'Thu', value: 0.6 }, { day: 'Fri', value: 0.2 }, { day: 'Sat', value: 0.4 }, { day: 'Sun', value: 0.1 },
];

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
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

function MiniChart({ title, data, dataKey, color }: any) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-100 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E4" />
          <XAxis dataKey="week" stroke="#737373" fontSize={11} />
          <YAxis stroke="#737373" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #DADADA', borderRadius: 8, fontSize: 12, color: '#0A0A0A' }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(() => store.getDashboardData());
  useEffect(() => { const t = setInterval(() => setDashData(store.getDashboardData()), 1000); return () => clearInterval(t); }, []);

  const actions = [
    { label: 'Scan Receipt', icon: Leaf, color: 'bg-primary', desc: 'Log a carbon footprint', path: '/carbon' },
    { label: 'Log Energy Bill', icon: Zap, color: 'bg-warning', desc: 'Track energy usage', path: '/energy' },
    { label: 'Log Food Waste', icon: Trash2, color: 'bg-error', desc: 'Record wasted food', path: '/food-waste' },
    { label: 'View Audit', icon: Target, color: 'bg-secondary', desc: 'Energy efficiency tips', path: '/energy' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-dark-200 text-sm mt-1">Your sustainability overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Leaf} label="Carbon Footprint" value={dashData.carbon || 0} unit="kg CO\u2082e" trend={dashData.carbonEntries > 0 ? `${dashData.carbonEntries} receipts` : 'No data yet'} trendUp={false} color="bg-primary" path="/carbon" />
        <StatCard icon={Zap} label="Energy Usage" value={dashData.energy || 0} unit="kWh" trend={dashData.energyBills > 0 ? `${dashData.energyBills} bills` : 'No data yet'} trendUp={true} color="bg-warning" path="/energy" />
        <StatCard icon={Trash2} label="Food Waste" value={dashData.wasteKg || 0} unit="kg" trend={dashData.wasteCount > 0 ? `${dashData.wasteCount} items logged` : 'No data yet'} trendUp={false} color="bg-error" path="/food-waste" />
        <StatCard icon={Flame} label="Waste Streak" value="14" unit="days" trend="Best: 21" trendUp={false} color="bg-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniChart title="Carbon Trend" data={carbonData} dataKey="value" color="#22C55E" />
        <MiniChart title="Energy Trend" data={energyData} dataKey="value" color="#F59E0B" />
        <MiniChart title="Waste This Week" data={wasteData} dataKey="value" color="#EF4444" />
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-dark-100 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} className="card hover:border-primary/50 transition-all text-left group cursor-pointer">
              <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-dark-50">{action.label}</p>
              <p className="text-xs text-dark-300 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
