import { useState, useRef } from 'react';
import { Zap, Plus, TrendingDown, Lightbulb, Wrench, ArrowRight, X, Upload, CheckCircle2, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeBill } from '../lib/aiAnalysis';
import { store } from '../lib/store';
import { useChartChrome } from '../lib/chartColors';

interface Bill {
  id: string;
  month: string;
  provider: string;
  electricity: number;
  gas: number;
  water: number;
  cost: number;
  imagePreview?: string;
}

interface Appliance {
  name: string;
  type: string;
  wattage: number;
  hours: number;
  efficiency: number;
  energyStar: boolean;
}

function ScanBillModal({ onClose, onSave }: { onClose: () => void; onSave: (bill: Bill) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Bill | null>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setStep('analyzing');
    const stages = [400, 600, 500, 400, 300];
    let p = 0;
    for (const d of stages) { await new Promise(r => setTimeout(r, d)); p += 20; setProgress(p); }
    const bill = await analyzeBill(file);
    const newBill: Bill = { id: String(Date.now()), month: bill.period, provider: bill.provider, electricity: bill.electricity, gas: bill.gas, water: bill.water, cost: bill.cost, imagePreview: bill.imagePreview };
    setResult(newBill);
    setStep('results');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) handleFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Scan Energy Bill</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>

        {step === 'upload' && (
          <div className="p-5 space-y-4">
            <div
              className="border-2 border-dashed border-dark-400 hover:border-primary rounded-xl p-8 text-center transition-all cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-dark-300 mx-auto mb-3" />
              <p className="text-sm font-medium">Drop a bill image or PDF here</p>
              <p className="text-xs text-dark-300 mt-1">AI will extract usage data automatically</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fileRef.current?.click()} className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Camera
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Browse
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5">
                PDF
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {step === 'analyzing' && (
          <div className="p-5 space-y-4">
            {preview && <img src={preview} className="w-full h-40 object-cover rounded-lg" alt="Bill" />}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-200">Processing bill...</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-dark-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Document loaded</div>
                {progress >= 20 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> OCR text extraction</div>}
                {progress >= 40 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Usage data identified</div>}
                {progress >= 60 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Cost breakdown parsed</div>}
                {progress >= 80 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Carbon estimate computed</div>}
                {progress >= 100 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Analysis complete</div>}
              </div>
            </div>
          </div>
        )}

        {step === 'results' && result && (
          <div className="p-5 space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary">Bill Analyzed</p>
                <p className="text-xs text-dark-200">{result.provider} · {result.month}</p>
              </div>
            </div>
            {result.imagePreview && <img src={result.imagePreview} className="w-full h-28 object-cover rounded-lg" alt="Bill" />}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-warning">{result.electricity}</p>
                <p className="text-xs text-dark-300">kWh</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-error">{result.gas}</p>
                <p className="text-xs text-dark-300">therms</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-400">{result.water}</p>
                <p className="text-xs text-dark-300">gal</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-secondary">${result.cost}</p>
                <p className="text-xs text-dark-300">total</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          {step === 'results' && result && (
            <button onClick={() => { onSave(result); onClose(); }} className="btn-primary flex-1">Save Bill</button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddBillModal({ onClose, onSave }: { onClose: () => void; onSave: (form: { provider: string; period: string; electricity: string; gas: string; water: string; cost: string }) => void }) {
  const [form, setForm] = useState({ provider: '', period: '', electricity: '', gas: '', water: '', cost: '' });
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Add Energy Bill</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-dark-300 mb-1 block">Provider</label><input className="w-full" placeholder="e.g. Hydro One" value={form.provider} onChange={(e) => update('provider', e.target.value)} /></div>
            <div><label className="text-xs text-dark-300 mb-1 block">Period</label><input className="w-full" type="month" value={form.period} onChange={(e) => update('period', e.target.value)} /></div>
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

const initialAppliances: Appliance[] = [
  { name: 'Refrigerator', type: 'Kitchen', wattage: 150, hours: 24, efficiency: 85, energyStar: true },
  { name: 'Washing Machine', type: 'Laundry', wattage: 500, hours: 1, efficiency: 72, energyStar: false },
  { name: 'Air Conditioner', type: 'HVAC', wattage: 3500, hours: 8, efficiency: 65, energyStar: false },
  { name: 'LED TV 55"', type: 'Living Room', wattage: 80, hours: 6, efficiency: 92, energyStar: true },
  { name: 'Desktop Computer', type: 'Office', wattage: 300, hours: 8, efficiency: 78, energyStar: false },
];

const initialBills: Bill[] = [
  { id: 'b1', month: '2026-01', provider: 'Hydro One', electricity: 380, gas: 42, water: 28, cost: 145.20 },
  { id: 'b2', month: '2026-02', provider: 'Hydro One', electricity: 365, gas: 38, water: 26, cost: 138.50 },
  { id: 'b3', month: '2026-03', provider: 'Hydro One', electricity: 340, gas: 30, water: 30, cost: 125.80 },
  { id: 'b4', month: '2026-04', provider: 'Toronto Hydro', electricity: 310, gas: 22, water: 32, cost: 112.40 },
  { id: 'b5', month: '2026-05', provider: 'Toronto Hydro', electricity: 290, gas: 15, water: 35, cost: 98.60 },
  { id: 'b6', month: '2026-06', provider: 'Toronto Hydro', electricity: 280, gas: 10, water: 38, cost: 92.30 },
];

const recommendations = [
  { title: 'Switch to LED bulbs', savings: '$120/yr', priority: 'high' as const, icon: Lightbulb, desc: 'Replace 8 incandescent bulbs with LED alternatives' },
  { title: 'Service AC unit', savings: '$200/yr', priority: 'medium' as const, icon: Wrench, desc: 'Your 12-year-old AC is running inefficiently' },
  { title: 'Weather-strip windows', savings: '$85/yr', priority: 'low' as const, icon: Wrench, desc: 'Seal drafty windows to reduce heating/cooling loss' },
];

export default function EnergyPage() {
  const [tab, setTab] = useState<'overview' | 'appliances' | 'audit'>('overview');
  const [showAddBill, setShowAddBill] = useState(false);
  const [showScanBill, setShowScanBill] = useState(false);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const chrome = useChartChrome();

  // Compute chart data from actual bills
  const chartData = [...bills].reverse().map(b => ({
    month: new Date(b.month + '-01').toLocaleString('en', { month: 'short' }),
    electricity: b.electricity,
    gas: b.gas,
    water: b.water,
  }));

  const avgElectricity = bills.length > 0 ? Math.round(bills.reduce((s, b) => s + b.electricity, 0) / bills.length) : 0;
  const latestBill = bills[0];

  return (
    <div className="space-y-6">
      {showAddBill && <AddBillModal onClose={() => setShowAddBill(false)} onSave={(form) => {
        const newBill: Bill = { id: String(Date.now()), month: form.period || new Date().toISOString().slice(0, 7), provider: form.provider, electricity: parseFloat(form.electricity) || 0, gas: parseFloat(form.gas) || 0, water: parseFloat(form.water) || 0, cost: parseFloat(form.cost) || 0 };
        setBills([newBill, ...bills]);
        store.addEnergy({ id: newBill.id, period: newBill.month, electricity: newBill.electricity, gas: newBill.gas, water: newBill.water, cost: newBill.cost });
        setShowAddBill(false);
      }} />}
      {showScanBill && <ScanBillModal onClose={() => setShowScanBill(false)} onSave={(bill) => { setBills([bill, ...bills]); store.addEnergy({ id: bill.id, period: bill.month, electricity: bill.electricity, gas: bill.gas, water: bill.water, cost: bill.cost }); setShowScanBill(false); }} />}
      {showAddAppliance && <AddApplianceModal onClose={() => setShowAddAppliance(false)} onSave={(name, wattage, hours, type) => {
        setAppliances([...appliances, { name, type, wattage, hours, efficiency: 75, energyStar: wattage < 500 }]);
        setShowAddAppliance(false);
      }} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Energy Monitor</h1>
          <p className="text-dark-200 text-sm mt-1">Track your home energy usage</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScanBill(true)} className="btn-primary flex items-center gap-2"><Zap className="w-4 h-4" /> Scan Bill</button>
          <button onClick={() => setShowAddBill(true)} className="btn-outline flex items-center gap-2"><Plus className="w-4 h-4" /> Add Bill</button>
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
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Avg Monthly</p>
              <p className="text-2xl font-bold text-warning mt-1">{avgElectricity} kWh</p>
              <p className="text-xs text-dark-300 mt-1">electricity</p>
            </div>
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Latest Bill</p>
              <p className="text-2xl font-bold text-dark-50 mt-1">{latestBill?.electricity || 0} kWh</p>
              <p className="text-xs text-dark-300 mt-1">{latestBill?.month || 'N/A'}</p>
            </div>
            <div className="card-elevated">
              <p className="text-dark-200 text-xs">Appliances</p>
              <p className="text-2xl font-bold text-secondary mt-1">{appliances.length}</p>
              <p className="text-xs text-dark-300 mt-1">tracked devices</p>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Monthly Usage (from {bills.length} bills)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} />
                <XAxis dataKey="month" stroke={chrome.axis} fontSize={11} />
                <YAxis stroke={chrome.axis} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, color: chrome.tooltipText, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="electricity" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Electricity (kWh)" />
                <Bar dataKey="gas" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gas (therms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {bills.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-dark-100 mb-3">Bill History</h3>
              <div className="space-y-2">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-warning/20 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-warning" /></div>
                      <div>
                        <p className="text-sm font-medium">{bill.provider}</p>
                        <p className="text-xs text-dark-300">{bill.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{bill.electricity} kWh</p>
                      <p className="text-xs text-secondary">${bill.cost.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
