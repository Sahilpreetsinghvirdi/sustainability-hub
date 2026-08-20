import { useState } from 'react';
import { Zap, Plus, DollarSign, TrendingDown, Lightbulb, Wrench, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', electricity: 380, gas: 42, water: 28 },
  { month: 'Feb', electricity: 365, gas: 38, water: 26 },
  { month: 'Mar', electricity: 340, gas: 30, water: 30 },
  { month: 'Apr', electricity: 310, gas: 22, water: 32 },
  { month: 'May', electricity: 290, gas: 15, water: 35 },
  { month: 'Jun', electricity: 280, gas: 10, water: 38 },
];

const appliances = [
  { name: 'Refrigerator', type: 'Kitchen', wattage: 150, hours: 24, efficiency: 85, energyStar: true },
  { name: 'Washing Machine', type: 'Laundry', wattage: 500, hours: 1, efficiency: 72, energyStar: false },
  { name: 'Air Conditioner', type: 'HVAC', wattage: 3500, hours: 8, efficiency: 65, energyStar: false },
  { name: 'LED TV 55"', type: 'Living Room', wattage: 80, hours: 6, efficiency: 92, energyStar: true },
  { name: 'Desktop Computer', type: 'Office', wattage: 300, hours: 8, efficiency: 78, energyStar: false },
];

const recommendations = [
  { title: 'Switch to LED bulbs', savings: '$120/yr', priority: 'high', icon: Lightbulb, desc: 'Replace 8 incandescent bulbs with LED alternatives' },
  { title: 'Service AC unit', savings: '$200/yr', priority: 'medium', icon: Wrench, desc: 'Your 12-year-old AC is running inefficiently' },
  { title: 'Weather-strip windows', savings: '$85/yr', priority: 'low', icon: Wrench, desc: 'Seal drafty windows to reduce heating/cooling loss' },
];

export default function EnergyPage() {
  const [tab, setTab] = useState<'overview' | 'appliances' | 'audit'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Energy Monitor</h1>
          <p className="text-dark-200 text-sm mt-1">Track electricity, gas, and water usage</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {(['overview', 'appliances', 'audit'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-dark-200 hover:text-dark-50'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Electricity</p>
              <p className="text-xl font-bold text-warning mt-1">280 kWh</p>
              <p className="text-xs text-primary mt-1">↓ 8% vs last month</p>
            </div>
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Natural Gas</p>
              <p className="text-xl font-bold text-error mt-1">10 therms</p>
              <p className="text-xs text-primary mt-1">↓ 33% vs last month</p>
            </div>
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Water</p>
              <p className="text-xl font-bold text-secondary mt-1">3,800 gal</p>
              <p className="text-xs text-error mt-1">↑ 9% vs last month</p>
            </div>
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Total Cost</p>
              <p className="text-xl font-bold text-dark-50 mt-1">$142</p>
              <p className="text-xs text-primary mt-1">↓ 12% vs last month</p>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Monthly Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="electricity" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="water" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'appliances' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-100">Appliances ({appliances.length})</h3>
            <button className="btn-outline text-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          </div>
          <div className="space-y-3">
            {appliances.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.efficiency >= 80 ? 'bg-primary/20' : a.efficiency >= 65 ? 'bg-warning/20' : 'bg-error/20'}`}>
                    <Zap className={`w-5 h-5 ${a.efficiency >= 80 ? 'text-primary' : a.efficiency >= 65 ? 'text-warning' : 'text-error'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-dark-300">{a.type} · {a.wattage}W · {a.hours}h/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {a.energyStar && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Energy Star</span>}
                  <div className="text-right">
                    <p className="text-sm font-medium">{a.efficiency}%</p>
                    <p className="text-xs text-dark-300">efficiency</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="card-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-dark-300">HOME ENERGY SCORE</p>
                <p className="text-3xl font-bold text-primary">62<span className="text-lg text-dark-300">/100</span></p>
              </div>
            </div>
            <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-error via-warning to-primary rounded-full" style={{ width: '62%' }} />
            </div>
            <div className="flex justify-between text-xs text-dark-300 mt-1">
              <span>Inefficient</span>
              <span>Efficient</span>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.priority === 'high' ? 'bg-error/20' : r.priority === 'medium' ? 'bg-warning/20' : 'bg-dark-400'}`}>
                      <r.icon className={`w-5 h-5 ${r.priority === 'high' ? 'text-error' : r.priority === 'medium' ? 'text-warning' : 'text-dark-200'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-dark-300">{r.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{r.savings}</span>
                    <ArrowRight className="w-4 h-4 text-dark-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
