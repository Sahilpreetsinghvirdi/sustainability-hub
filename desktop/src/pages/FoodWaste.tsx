import { useState, useRef } from 'react';
import { Plus, Camera, Flame, Calendar, TrendingDown, Leaf, AlertTriangle, X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyzeImage } from '../lib/aiAnalysis';
import { store } from '../lib/store';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const REASONS = ['Plate waste', 'Spoilage', 'Preparation', 'Over-portioned', 'Other'];

interface WasteLog {
  id: string;
  date: string;
  meal: string;
  desc: string;
  amount: number;
  reason: string;
  carbon: number;
  aiItems?: { name: string; confidence: number; carbonKg: number; category: string; portion: string }[];
  imagePreview?: string;
}

function PhotoLogModal({ onClose, onSave }: { onClose: () => void; onSave: (log: WasteLog) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ items: { name: string; confidence: number; carbonKg: number; category: string; portion: string }[]; totalCarbon: number; imagePreview: string } | null>(null);
  const [selectedMeal, setSelectedMeal] = useState('Dinner');
  const [reason, setReason] = useState('Plate waste');

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setStep('analyzing');
    const stages = [
      { dur: 300 }, { dur: 500 }, { dur: 700 }, { dur: 400 }, { dur: 200 },
    ];
    let p = 0;
    for (const s of stages) { await new Promise(r => setTimeout(r, s.dur)); p += 20; setProgress(p); }
    const analysis = await analyzeImage(file);
    setResult({ items: analysis.detectedItems, totalCarbon: analysis.totalCarbonEstimate, imagePreview: analysis.imagePreview });
    setStep('results');
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      meal: selectedMeal,
      desc: result.items.map(i => i.name).join(', '),
      amount: Math.round(result.items.reduce((s, i) => s + i.carbonKg * 120, 0)),
      reason,
      carbon: result.totalCarbon,
      aiItems: result.items,
      imagePreview: result.imagePreview,
    });
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Log Food Waste</h2>
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
              <Camera className="w-10 h-10 text-dark-300 mx-auto mb-3" />
              <p className="text-sm font-medium">Take a photo or drop an image</p>
              <p className="text-xs text-dark-300 mt-1">AI will identify and measure the food waste</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fileRef.current?.click()} className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Take Photo
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload Image
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {step === 'analyzing' && (
          <div className="p-5 space-y-4">
            {preview && <img src={preview} className="w-full h-40 object-cover rounded-lg" alt="Food waste" />}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-200">AI analyzing food waste...</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-dark-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Image captured</div>
                {progress >= 20 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Color analysis complete</div>}
                {progress >= 40 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Food items identified</div>}
                {progress >= 60 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Portion size estimated</div>}
                {progress >= 80 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Carbon footprint calculated</div>}
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
                <p className="text-sm font-medium text-primary">AI Analysis Complete</p>
                <p className="text-xs text-dark-200">Identified {result.items.length} item(s) · {result.totalCarbon} kg CO₂e</p>
              </div>
            </div>
            {result.imagePreview && <img src={result.imagePreview} className="w-full h-28 object-cover rounded-lg" alt="Analyzed" />}
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-dark-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-xs font-bold text-primary">{item.confidence}%</div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-dark-300">{item.category}{item.portion ? ' \u00b7 ' + item.portion : ''}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-primary">{item.carbonKg} kg CO₂</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-dark-300 mb-1 block">Meal</label>
                <div className="flex gap-1.5">
                  {MEALS.map(m => (
                    <button key={m} onClick={() => setSelectedMeal(m)} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${selectedMeal === m ? 'bg-primary text-white' : 'bg-dark-600 text-dark-300'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-300 mb-1 block">Reason</label>
                <div className="flex flex-wrap gap-1.5">
                  {REASONS.map(r => (
                    <button key={r} onClick={() => setReason(r)} className={`px-2 py-1 rounded-md text-xs transition-colors ${reason === r ? 'bg-primary text-white' : 'bg-dark-600 text-dark-300'}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          {step === 'results' && <button onClick={handleSave} className="btn-primary flex-1">Save Log</button>}
        </div>
      </div>
    </div>
  );
}

function ManualLogModal({ onClose, onSave }: { onClose: () => void; onSave: (log: WasteLog) => void }) {
  const [meal, setMeal] = useState('Dinner');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Plate waste');

  const handleSave = () => {
    if (!desc.trim()) return;
    const grams = parseFloat(amount) || 100;
    onSave({
      id: String(Date.now()), date: new Date().toISOString().split('T')[0], meal, desc: desc.trim(),
      amount: grams, reason, carbon: Math.round((grams * 0.004 + Math.random() * 0.3) * 100) / 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Log Food Waste</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-dark-300 mb-1.5 block">Meal</label>
            <div className="flex gap-2">
              {MEALS.map(m => <button key={m} onClick={() => setMeal(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${meal === m ? 'bg-primary text-white' : 'bg-dark-600 text-dark-200 hover:bg-dark-500'}`}>{m}</button>)}
            </div>
          </div>
          <div><label className="text-xs text-dark-300 mb-1 block">What was wasted?</label><input className="w-full" placeholder="e.g. Leftover pasta, salad..." value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-dark-300 mb-1 block">Amount (grams)</label><input className="w-full" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div>
              <label className="text-xs text-dark-300 mb-1 block">Reason</label>
              <div className="flex flex-wrap gap-1.5">
                {REASONS.map(r => <button key={r} onClick={() => setReason(r)} className={`px-2 py-1 rounded-md text-xs transition-colors ${reason === r ? 'bg-primary text-white' : 'bg-dark-600 text-dark-300'}`}>{r}</button>)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1">Log Waste</button>
        </div>
      </div>
    </div>
  );
}

function LogDetailModal({ log, onClose }: { log: WasteLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Waste Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          {log.imagePreview && <img src={log.imagePreview} className="w-full h-32 object-cover rounded-lg" alt="Waste" />}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Meal</p><p className="text-sm font-medium mt-1 capitalize">{log.meal}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Date</p><p className="text-sm font-medium mt-1">{log.date}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Amount</p><p className="text-sm font-medium mt-1">{log.amount}g</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Carbon Impact</p><p className="text-sm font-medium text-error mt-1">{log.carbon} kg CO₂</p></div>
          </div>
          <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Description</p><p className="text-sm font-medium mt-1">{log.desc}</p></div>
          <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Reason</p><p className="text-sm font-medium mt-1">{log.reason}</p></div>
          {log.aiItems && log.aiItems.length > 0 && (
            <div><p className="text-xs text-dark-300 mb-2">AI Detected Items</p>
              <div className="space-y-1">{log.aiItems.map((item, i) => (
                <div key={i} className="flex justify-between p-2 bg-dark-600 rounded text-xs">
                  <span className="font-medium">{item.name} <span className="text-dark-300">({item.confidence}%)</span></span>
                  <span className="text-primary">{item.carbonKg}kg CO₂</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-dark-500"><button onClick={onClose} className="btn-outline w-full">Close</button></div>
      </div>
    </div>
  );
}

const initialLogs: WasteLog[] = [
  { id: '1', date: '2026-08-19', meal: 'Dinner', desc: 'Leftover pasta and salad', amount: 250, reason: 'Overcooked', carbon: 0.8 },
  { id: '2', date: '2026-08-19', meal: 'Lunch', desc: 'Sandwich crusts', amount: 80, reason: 'Not eaten', carbon: 0.2 },
  { id: '3', date: '2026-08-18', meal: 'Dinner', desc: 'Expired yogurt', amount: 150, reason: 'Spoiled', carbon: 0.5 },
  { id: '4', date: '2026-08-17', meal: 'Lunch', desc: 'Too much rice', amount: 320, reason: 'Over-portioned', carbon: 1.1 },
  { id: '5', date: '2026-08-16', meal: 'Breakfast', desc: 'Burnt toast', amount: 60, reason: 'Burned', carbon: 0.15 },
];

export default function FoodWastePage() {
  const [tab, setTab] = useState<'logs' | 'streak' | 'tips'>('logs');
  const [showPhoto, setShowPhoto] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [detailLog, setDetailLog] = useState<WasteLog | null>(null);
  const [logs, setLogs] = useState<WasteLog[]>(initialLogs);

  const totalWaste = logs.reduce((s, l) => s + l.amount, 0) / 1000;
  const totalCarbon = logs.reduce((s, l) => s + l.carbon, 0);

  // Compute pie data from actual logs
  const categoryCounts: Record<string, number> = {};
  logs.forEach(l => { categoryCounts[l.reason] = (categoryCounts[l.reason] || 0) + l.amount; });
  const totalGrams = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const pieData = Object.entries(categoryCounts)
    .map(([name, grams]) => ({ name, value: Math.round(grams / totalGrams * 100), color: PIE_COLORS[name] || '#737373' }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {showPhoto && <PhotoLogModal onClose={() => setShowPhoto(false)} onSave={(log) => { setLogs([log, ...logs]); store.addWaste({ id: log.id, date: log.date, meal: log.meal, desc: log.desc, amount: log.amount, reason: log.reason, carbon: log.carbon }); setShowPhoto(false); }} />}
      {showManual && <ManualLogModal onClose={() => setShowManual(false)} onSave={(log) => { setLogs([log, ...logs]); store.addWaste({ id: log.id, date: log.date, meal: log.meal, desc: log.desc, amount: log.amount, reason: log.reason, carbon: log.carbon }); setShowManual(false); }} />}
      {detailLog && <LogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Waste Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Log meals and reduce food waste</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPhoto(true)} className="btn-primary flex items-center gap-2"><Camera className="w-4 h-4" /> Log with Photo</button>
          <button onClick={() => setShowManual(true)} className="btn-outline flex items-center gap-2"><Plus className="w-4 h-4" /> Manual Log</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-warning" /><p className="text-dark-200 text-xs">Current Streak</p></div>
          <p className="text-2xl font-bold text-warning">14 days</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">This Week</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{totalWaste.toFixed(1)} kg</p>
          <p className="text-xs text-primary mt-1">{logs.length} items logged</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">CO₂ Impact</p>
          <p className="text-2xl font-bold text-error mt-1">{totalCarbon.toFixed(2)} kg</p>
          <p className="text-xs text-dark-300 mt-1">CO₂ equivalent</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Logs</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{logs.length}</p>
          <p className="text-xs text-dark-300 mt-1">all time</p>
        </div>
      </div>

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {(['logs', 'streak', 'tips'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-dark-200 hover:text-dark-50'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Recent Logs</h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600/80 transition-colors" onClick={() => setDetailLog(log)}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.aiItems ? 'bg-purple-500/20 text-purple-400' : MEAL_BG[log.meal.toLowerCase()] || 'bg-dark-400 text-dark-200'}`}>
                      {log.aiItems ? 'AI' : log.meal}
                    </span>
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
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #DADADA', color: '#0A0A0A', borderRadius: 8, fontSize: 12 }} />
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
              </>
            ) : (
              <p className="text-xs text-dark-300 text-center py-8">No data yet. Log some waste to see the chart.</p>
            )}
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
              <div><p className="text-2xl font-bold text-dark-50">21</p><p className="text-xs text-dark-300">Best streak</p></div>
              <div><p className="text-2xl font-bold text-dark-50">12.3</p><p className="text-xs text-dark-300">Average</p></div>
            </div>
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${i < 14 ? 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]' : i < 21 ? 'bg-dark-500' : 'bg-dark-600'}`} />
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
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0"><tip.icon className="w-5 h-5 text-primary" /></div>
              <div><p className="text-sm font-semibold">{tip.title}</p><p className="text-xs text-dark-200 mt-1 leading-relaxed">{tip.desc}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PIE_COLORS: Record<string, string> = {
  'Plate waste': '#EF4444', 'Spoilage': '#F59E0B', 'Preparation': '#8B5CF6', 'Over-portioned': '#3B82F6', 'Other': '#64748B',
  'Not eaten': '#F97316', 'Burned': '#EC4899', 'Overcooked': '#A855F7', 'Spoiled': '#F59E0B',
};

const MEAL_BG: Record<string, string> = {
  breakfast: 'bg-warning/20 text-warning', lunch: 'bg-primary/20 text-primary',
  dinner: 'bg-secondary/20 text-secondary', snack: 'bg-accent/20 text-accent',
};
