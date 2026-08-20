import { Leaf, Zap, Trash2, TrendingUp, TrendingDown, Flame, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

function StatCard({ icon: Icon, label, value, unit, trend, trendUp, color }: any) {
  return (
    <div className="card-elevated flex items-start justify-between">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
          <YAxis stroke="#64748B" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-dark-200 text-sm mt-1">Your sustainability overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Leaf} label="Carbon Footprint" value="187" unit="kg CO₂e" trend="12%" trendUp={false} color="bg-primary" />
        <StatCard icon={Zap} label="Energy Usage" value="423" unit="kWh" trend="5%" trendUp={true} color="bg-warning" />
        <StatCard icon={Trash2} label="Food Waste" value="4.2" unit="kg" trend="20%" trendUp={false} color="bg-error" />
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
          {[
            { label: 'Scan Receipt', icon: Leaf, color: 'bg-primary', desc: 'Log a carbon footprint' },
            { label: 'Log Energy Bill', icon: Zap, color: 'bg-warning', desc: 'Track energy usage' },
            { label: 'Log Food Waste', icon: Trash2, color: 'bg-error', desc: 'Record wasted food' },
            { label: 'View Audit', icon: Target, color: 'bg-secondary', desc: 'Energy efficiency tips' },
          ].map((action) => (
            <button key={action.label} className="card hover:border-primary/50 transition-all text-left group">
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
