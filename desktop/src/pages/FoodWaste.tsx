import { useState } from 'react';
import { Plus, Camera, Flame, Calendar, TrendingDown, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const mockLogs = [
  { id: '1', date: '2026-08-19', meal: 'Dinner', desc: 'Leftover pasta and salad', amount: 250, reason: 'Overcooked', category: 'Preparation', carbon: 0.8 },
  { id: '2', date: '2026-08-19', meal: 'Lunch', desc: 'Sandwich crusts', amount: 80, reason: 'Not eaten', category: 'Plate waste', carbon: 0.2 },
  { id: '3', date: '2026-08-18', meal: 'Dinner', desc: 'Expired yogurt', amount: 150, reason: 'Spoiled', category: 'Spoilage', carbon: 0.5 },
  { id: '4', date: '2026-08-17', meal: 'Lunch', desc: 'Too much rice', amount: 320, reason: 'Over-portioned', category: 'Plate waste', carbon: 1.1 },
  { id: '5', date: '2026-08-16', meal: 'Breakfast', desc: 'Burnt toast', amount: 60, reason: 'Burned', category: 'Preparation', carbon: 0.15 },
];

const pieData = [
  { name: 'Plate waste', value: 40, color: '#EF4444' },
  { name: 'Spoilage', value: 25, color: '#F59E0B' },
  { name: 'Preparation', value: 20, color: '#8B5CF6' },
  { name: 'Other', value: 15, color: '#64748B' },
];

const mealColors: Record<string, string> = {
  breakfast: 'bg-warning/20 text-warning',
  lunch: 'bg-primary/20 text-primary',
  dinner: 'bg-secondary/20 text-secondary',
  snack: 'bg-accent/20 text-accent',
};

export default function FoodWastePage() {
  const [tab, setTab] = useState<'logs' | 'streak' | 'tips'>('logs');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Waste Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Log meals and reduce food waste</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Log with Photo
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Plus className="w-4 h-4" /> Manual Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-warning" />
            <p className="text-dark-200 text-xs">Current Streak</p>
          </div>
          <p className="text-2xl font-bold text-warning">14 days</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">This Week</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">4.2 kg</p>
          <p className="text-xs text-primary mt-1">↓ 20% vs last week</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">CO₂ Impact</p>
          <p className="text-2xl font-bold text-error mt-1">2.75 kg</p>
          <p className="text-xs text-dark-300 mt-1">CO₂ equivalent</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Logs</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{mockLogs.length}</p>
          <p className="text-xs text-dark-300 mt-1">this week</p>
        </div>
      </div>

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {(['logs', 'streak', 'tips'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-dark-200 hover:text-dark-50'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Recent Logs</h3>
            <div className="space-y-2">
              {mockLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${mealColors[log.meal]}`}>{log.meal}</span>
                    <div>
                      <p className="text-sm font-medium">{log.desc}</p>
                      <p className="text-xs text-dark-300">{log.date} · {log.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{log.amount}g</p>
                    <p className="text-xs text-error">{log.carbon} kg CO₂</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Waste by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-dark-200">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'streak' && (
        <div className="card-elevated">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-10 h-10 text-warning" />
            </div>
            <p className="text-4xl font-bold text-warning">14 Days</p>
            <p className="text-dark-200 mt-2">Current waste-reduction streak</p>
            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-2xl font-bold text-dark-50">21</p>
                <p className="text-xs text-dark-300">Best streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">12.3</p>
                <p className="text-xs text-dark-300">Average</p>
              </div>
            </div>
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${i < 14 ? 'bg-warning' : i < 21 ? 'bg-dark-500' : 'bg-dark-600'}`} />
              ))}
            </div>
            <p className="text-xs text-dark-300 mt-2">Last 30 days (yellow = streak day)</p>
          </div>
        </div>
      )}

      {tab === 'tips' && (
        <div className="space-y-4">
          {[
            { title: 'Plan meals before shopping', icon: Calendar, desc: 'Create a weekly meal plan to buy only what you need. This can reduce food waste by up to 25%.' },
            { title: 'Store food properly', icon: AlertTriangle, desc: 'Learn optimal storage conditions. Bananas, tomatoes, and potatoes should not be refrigerated.' },
            { title: 'Use the FIFO method', icon: Leaf, desc: 'First In, First Out. Place newer items behind older ones to ensure older food gets used first.' },
            { title: 'Compost leftovers', icon: TrendingDown, desc: 'Start composting unavoidable food scraps. This diverts waste from landfills and creates garden soil.' },
          ].map((tip, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="text-xs text-dark-200 mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
