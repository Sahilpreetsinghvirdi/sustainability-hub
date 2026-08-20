import { useState } from 'react';
import { Zap, Plus, DollarSign, TrendingDown, Lightbulb, Wrench, ArrowRight, X, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', electricity: 380, gas: 42, water: 28 },
  { month: 'Feb', electricity: 365, gas: 38, water: 26 },
  { month: 'Mar', electricity: 340, gas: 30, water: 30 },
  { month: 'Apr', electricity: 310, gas: 22, water: 32 },
  { month: 'May', electricity: 290, gas: 15, water: 35 },
  { month: 'Jun', electricity: 280, gas: 10, water: 38 },
];

interface BillForm {
  provider: string;
  period: string;
  electricity: string;
  gas: string;
  water: string;
  cost: string;
}

function AddBillModal({ onClose, onSave }: { onClose: () => void; onSave: (bill: BillForm) => void }) {
  const [form, setForm] = useState<BillForm>({ provider: '', period: '', electricity: '', gas: '', water: '', cost: '' });
  const update = (k: keyof BillForm, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Add Energy Bill</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-dark-300 mb-1 block">Utility Provider</label><input className="w-full" placeholder="e.g. Hydro One" value={form.provider} onChange={(e) => update('provider', e.target.value)} /></div>
            <div><label className="text-xs text-dark-300 mb-1 block">Billing Period</label><input className="w-full" type="month" value={form.period} onChange={(e) => update('period', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-dark-300 mb-1 block">Electricity (kWh)</label><input className="w-full" type="number" placeholder="0" value={form.electricity} onChange={(e) => update('electricity', e.target.value)} /></div>
            <div><label className="text-xs text-dark-300 mb-1 block">Gas (therms)</label><input className="w-full" type="number" placeholder="0" value={form.gas} onChange={(e) => update('gas', e.target.value)} /></div>
            <div><label className="text-xs text-dark-300 mb-1 block">Water (gal)</label><input className="w-full" type="number" placeholder="0" value={form.water} onChange={(e) => update('water', e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-dark-300 mb-1 block">Total Cost ($)</label><input className="w-full" type="number" step="0.01" placeholder="0.00" value={form.cost} onChange={(e) => update('cost', e.target.value)} /></div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => { if (form.provider) onSave(form); }} className="btn-primary flex-1">Save Bill</button>
        </div>
      </div>
    </div>
  );
}

function ScanBillModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Scan Energy Bill</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-primary bg-primary/10' : 'border-dark-400 hover:border-dark-300'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onConfirm(); }}
            onClick={onConfirm}
          >
            <Upload className="w-10 h-10 text-dark-300 mx-auto mb-3" />
            <p className="text-sm font-medium">Drop a bill image or PDF here</p>
            <p className="text-xs text-dark-300 mt-1">or click to browse files</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Camera', 'Gallery', 'PDF'].map((src) => (
              <button key={src} onClick={onConfirm} className="btn-outline text-xs py-2">{src}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddApplianceModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, wattage: number, hours: number, type: string) => void }) {
  const [name, setName] = useState('');
  const [wattage, setWattage] = useState('');
  const [hours, setHours] = useState('');
  const [type, setType] = useState('Kitchen');
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Add Appliance</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-xs text-dark-300 mb-1 block">Appliance Name</label><input className="w-full" placeholder="e.g. Washing Machine" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-dark-300 mb-1 block">Wattage (W)</label><input className="w-full" type="number" placeholder="0" value={wattage} onChange={(e) => setWattage(e.target.value)} /></div>
            <div><label className="text-xs text-dark-300 mb-1 block">Hours/Day</label><input className="w-full" type="number" step="0.5" placeholder="0" value={hours} onChange={(e) => setHours(e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-dark-300 mb-1 block">Type</label>
            <div className="flex gap-2">
              {['Kitchen', 'Laundry', 'HVAC', 'Living Room', 'Office'].map(t => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === t ? 'bg-primary text-white' : 'bg-dark-600 text-dark-200 hover:bg-dark-500'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => { if (name) onSave(name, parseFloat(wattage) || 0, parseFloat(hours) || 0, type); }} className="btn-primary flex-1">Add Appliance</button>
        </div>
      </div>
    </div>
  );
}

export default function EnergyPage() {
  const [tab, setTab] = useState<'overview' | 'appliances' | 'audit'>('overview');
  const [showAddBill, setShowAddBill] = useState(false);
  const [showScanBill, setShowScanBill] = useState(false);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [appliances, setAppliances] = useState(initialAppliances);
  const [bills, setBills] = useState<{ month: string; electricity: number; gas: number; water: number }[]>(monthlyData);

  const handleSaveBill = (form: BillForm) => {
    const newBill = {
      month: form.period || new Date().toISOString().slice(0, 7),
      electricity: parseFloat(form.electricity) || 0,
      gas: parseFloat(form.gas) || 0,
      water: parseFloat(form.water) || 0,
    };
    setBills([newBill, ...bills]);
    setShowAddBill(false);
  };

  const handleScanConfirm = () => {
    const newBill = {
      month: new Date().toISOString().slice(0, 7),
      electricity: Math.floor(Math.random() * 200 + 250),
      gas: Math.floor(Math.random() * 30 + 10),
      water: Math.floor(Math.random() * 15 + 20),
    };
    setBills([newBill, ...bills]);
    setShowScanBill(false);
  };

  const handleAddAppliance = (name: string, wattage: number, hours: number, type: string) => {
    setAppliances([...appliances, { name, type, wattage, hours, efficiency: 75, energyStar: wattage < 500 }]);
    setShowAddAppliance(false);
  };

  return (
    <div className="space-y-6">
      {showAddBill && <AddBillModal onClose={() => setShowAddBill(false)} onSave={handleSaveBill} />}
      {showScanBill && <ScanBillModal onClose={() => setShowScanBill(false)} onConfirm={handleScanConfirm} />}
      {showAddAppliance && <AddApplianceModal onClose={() => setShowAddAppliance(false)} onSave={handleAddAppliance} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Energy Monitor</h1>
          <p className="text-dark-200 text-sm mt-1">Track your home energy usage</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScanBill(true)} className="btn-primary flex items-center gap-2">
            <Zap className="w-4 h-4" /> Scan Bill
          </button>
          <button onClick={() => setShowAddBill(true)} className="btn-outline flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {(['overview', 'appliances', 'audit'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-dark-200 hover:text-dark-50'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="card-elevated"><p className="text-dark-200 text-xs">Avg Monthly</p><p className="text-2xl font-bold text-warning mt-1">{(bills.reduce((s, b) => s + b.electricity, 0) / bills.length).toFixed(0)} kWh</p></div>
            <div className="card-elevated"><p className="text-dark-200 text-xs">This Month</p><p className="text-2xl font-bold text-dark-50 mt-1">{bills[0]?.electricity || 0} kWh</p></div>
            <div className="card-elevated"><p className="text-dark-200 text-xs">Appliances</p><p className="text-2xl font-bold text-secondary mt-1">{appliances.length}</p></div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Monthly Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bills}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="electricity" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'appliances' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-100">Your Appliances</h3>
            <button onClick={() => setShowAddAppliance(true)} className="btn-primary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          </div>
          <div className="space-y-2">
            {appliances.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.efficiency > 80 ? 'bg-primary/20' : a.efficiency > 60 ? 'bg-warning/20' : 'bg-error/20'}`}>
                    <Zap className={`w-4 h-4 ${a.efficiency > 80 ? 'text-primary' : a.efficiency > 60 ? 'text-warning' : 'text-error'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-dark-300">{a.type} · {a.wattage}W · {a.hours}h/day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{(a.wattage * a.hours * 30 / 1000).toFixed(0)} kWh/mo</p>
                  <p className="text-xs text-dark-300">~${((a.wattage * a.hours * 30 / 1000) * 0.12).toFixed(0)}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="card-elevated">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Energy Efficiency Score</p>
                <p className="text-3xl font-bold text-primary mt-1">68<span className="text-lg text-dark-300">/100</span></p>
              </div>
            </div>
          </div>
          {recommendations.map((rec, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${rec.priority === 'high' ? 'bg-error/20' : rec.priority === 'medium' ? 'bg-warning/20' : 'bg-primary/20'}`}>
                <rec.icon className={`w-5 h-5 ${rec.priority === 'high' ? 'text-error' : rec.priority === 'medium' ? 'text-warning' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <span className="text-xs text-primary font-medium">{rec.savings}</span>
                </div>
                <p className="text-xs text-dark-200 mt-1">{rec.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-dark-300 mt-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const initialAppliances = [
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
