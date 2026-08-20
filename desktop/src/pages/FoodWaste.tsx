import { useState } from 'react';
import { Plus, Camera, Flame, Calendar, TrendingDown, TrendingUp, Leaf, AlertTriangle, X, Upload, Trash2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const REASONS = ['Plate waste', 'Spoilage', 'Preparation', 'Over-portioned', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  'Plate waste': 'bg-error/20 text-error',
  'Spoilage': 'bg-warning/20 text-warning',
  'Preparation': 'bg-purple-500/20 text-purple-400',
  'Over-portioned': 'bg-blue-500/20 text-blue-400',
  'Other': 'bg-dark-400 text-dark-200',
};
const mealColors: Record<string, string> = {
  breakfast: 'bg-warning/20 text-warning',
  lunch: 'bg-primary/20 text-primary',
  dinner: 'bg-secondary/20 text-secondary',
  snack: 'bg-accent/20 text-accent',
};

interface WasteLog {
  id: string;
  date: string;
  meal: string;
  desc: string;
  amount: number;
  reason: string;
  category: string;
  carbon: number;
}

function PhotoLogModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Log with Photo</h2>
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
            <Camera className="w-10 h-10 text-dark-300 mx-auto mb-3" />
            <p className="text-sm font-medium">Take a photo or drop an image</p>
            <p className="text-xs text-dark-300 mt-1">We'll analyze the food waste for you</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onConfirm} className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Take Photo
            </button>
            <button onClick={onConfirm} className="btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
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
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!desc.trim()) return;
    const grams = parseFloat(amount) || 100;
    const carbon = Math.round((grams * 0.004 + Math.random() * 0.3) * 100) / 100;
    onSave({
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      meal,
      desc: desc.trim(),
      amount: grams,
      reason,
      category: reason,
      carbon,
    });
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
              {MEALS.map(m => (
                <button key={m} onClick={() => setMeal(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${meal === m ? 'bg-primary text-white' : 'bg-dark-600 text-dark-200 hover:bg-dark-500'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-300 mb-1 block">What was wasted?</label>
            <input className="w-full" placeholder="e.g. Leftover pasta, salad..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-dark-300 mb-1 block">Amount (grams)</label>
              <input className="w-full" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-dark-300 mb-1 block">Reason</label>
              <div className="flex flex-wrap gap-1.5">
                {REASONS.map(r => (
                  <button key={r} onClick={() => setReason(r)} className={`px-2 py-1 rounded-md text-xs transition-colors ${reason === r ? 'bg-primary text-white' : 'bg-dark-600 text-dark-300 hover:bg-dark-500'}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-300 mb-1 block">Notes (optional)</label>
            <input className="w-full" placeholder="Any additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          <h2 className="text-lg font-bold">{log.desc}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Meal</p><p className="text-sm font-medium mt-1 capitalize">{log.meal}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Date</p><p className="text-sm font-medium mt-1">{log.date}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Amount</p><p className="text-sm font-medium mt-1">{log.amount}g</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Carbon Impact</p><p className="text-sm font-medium text-error mt-1">{log.carbon} kg CO₂</p></div>
          </div>
          <div className="bg-dark-600 rounded-lg p-3">
            <p className="text-xs text-dark-300">Reason</p>
            <p className="text-sm font-medium mt-1">{log.reason}</p>
          </div>
        </div>
        <div className="p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline w-full">Close</button>
        </div>
      </div>
    </div>
  );
}

function ConfettiStreak() {
  return (
    <div className="flex justify-center gap-1 mt-6">
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm transition-all duration-500 ${i < 14 ? 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]' : i < 21 ? 'bg-dark-500' : 'bg-dark-600'}`} />
      ))}
    </div>
  );
}

const pieData = [
  { name: 'Plate waste', value: 40, color: '#EF4444' },
  { name: 'Spoilage', value: 25, color: '#F59E0B' },
  { name: 'Preparation', value: 20, color: '#8B5CF6' },
  { name: 'Other', value: 15, color: '#64748B' },
];

export default function FoodWastePage() {
  const [tab, setTab] = useState<'logs' | 'streak' | 'tips'>('logs');
  const [showPhoto, setShowPhoto] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [detailLog, setDetailLog] = useState<WasteLog | null>(null);
  const [logs, setLogs] = useState<WasteLog[]>(initialLogs);

  const totalWaste = logs.reduce((s, l) => s + l.amount, 0) / 1000;
  const totalCarbon = logs.reduce((s, l) => s + l.carbon, 0);

  const handlePhotoConfirm = () => {
    const reasons = REASONS;
    const meals = MEALS;
    const descs = ['Half-eaten sandwich', 'Expired milk', 'Burnt rice', 'Leftover salad', 'Peelings and scraps'];
    const newLog: WasteLog = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      meal: meals[Math.floor(Math.random() * meals.length)],
      desc: descs[Math.floor(Math.random() * descs.length)],
      amount: Math.floor(Math.random() * 400 + 50),
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      category: reasons[Math.floor(Math.random() * reasons.length)],
      carbon: Math.round((Math.random() * 2 + 0.1) * 100) / 100,
    };
    setLogs([newLog, ...logs]);
    setShowPhoto(false);
  };

  const handleManualSave = (log: WasteLog) => {
    setLogs([log, ...logs]);
    setShowManual(false);
  };

  return (
    <div className="space-y-6">
      {showPhoto && <PhotoLogModal onClose={() => setShowPhoto(false)} onConfirm={handlePhotoConfirm} />}
      {showManual && <ManualLogModal onClose={() => setShowManual(false)} onSave={handleManualSave} />}
      {detailLog && <LogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Waste Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Log meals and reduce food waste</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPhoto(true)} className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Log with Photo
          </button>
          <button onClick={() => setShowManual(true)} className="btn-outline flex items-center gap-2">
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
          <p className="text-xs text-dark-300 mt-1">this session</p>
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
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600/80 transition-colors" onClick={() => setDetailLog(log)}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${mealColors[log.meal.toLowerCase()] || 'bg-dark-400 text-dark-200'}`}>{log.meal}</span>
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
              <div><p className="text-2xl font-bold text-dark-50">21</p><p className="text-xs text-dark-300">Best streak</p></div>
              <div><p className="text-2xl font-bold text-dark-50">12.3</p><p className="text-xs text-dark-300">Average</p></div>
            </div>
            <ConfettiStreak />
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

const initialLogs: WasteLog[] = [
  { id: '1', date: '2026-08-19', meal: 'Dinner', desc: 'Leftover pasta and salad', amount: 250, reason: 'Overcooked', category: 'Preparation', carbon: 0.8 },
  { id: '2', date: '2026-08-19', meal: 'Lunch', desc: 'Sandwich crusts', amount: 80, reason: 'Not eaten', category: 'Plate waste', carbon: 0.2 },
  { id: '3', date: '2026-08-18', meal: 'Dinner', desc: 'Expired yogurt', amount: 150, reason: 'Spoiled', category: 'Spoilage', carbon: 0.5 },
  { id: '4', date: '2026-08-17', meal: 'Lunch', desc: 'Too much rice', amount: 320, reason: 'Over-portioned', category: 'Plate waste', carbon: 1.1 },
  { id: '5', date: '2026-08-16', meal: 'Breakfast', desc: 'Burnt toast', amount: 60, reason: 'Burned', category: 'Preparation', carbon: 0.15 },
];
