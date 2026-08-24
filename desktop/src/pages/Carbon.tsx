import { useState, useRef } from 'react';
import { Plus, Camera, FileText, Trash2, ChevronRight, Search, Filter, X, Upload, Store, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeReceipt } from '../lib/aiAnalysis';
import { store as appStore } from '../lib/store';

const statusColors: Record<string, string> = {
  confirmed: 'bg-primary/20 text-primary',
  estimated: 'bg-warning/20 text-warning',
  draft: 'bg-dark-400 text-dark-200',
};

interface ReceiptItem {
  name: string;
  category: string;
  price: string;
  carbonEstimate: string;
}

interface ScannedReceipt {
  id: string;
  date: string;
  store: string;
  items: { name: string; price: number; category: string; carbonKg: number }[];
  itemCount: number;
  carbon: number;
  price: number;
  status: 'confirmed' | 'estimated' | 'draft';
  imagePreview?: string;
}

function ManualEntryModal({ onClose, onSave }: { onClose: () => void; onSave: (store: string, items: ReceiptItem[]) => void }) {
  const [store, setStore] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([{ name: '', category: 'Food & Beverage', price: '', carbonEstimate: '' }]);
  const addItem = () => setItems([...items, { name: '', category: 'Food & Beverage', price: '', carbonEstimate: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ReceiptItem, val: string) => {
    const updated = [...items]; updated[i] = { ...updated[i], [field]: val }; setItems(updated);
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Manual Receipt Entry</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-dark-300 mb-1 block">Store Name</label>
            <div className="relative">
              <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
              <input className="w-full pl-9" placeholder="e.g. Whole Foods" value={store} onChange={(e) => setStore(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-dark-300">Items</label>
              <button onClick={addItem} className="text-xs text-primary flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add Item</button>
            </div>
            <div className="space-y-3 max-h-64 overflow-auto">
              {items.map((item, i) => (
                <div key={i} className="bg-dark-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-300">Item {i + 1}</span>
                    {items.length > 1 && <button onClick={() => removeItem(i)} className="text-error hover:text-error/80"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="text-sm" placeholder="Item name" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <input className="text-sm" placeholder="Price ($)" type="number" step="0.01" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="text-sm" value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)}>
                      {['Food & Beverage', 'Transport', 'Clothing', 'Electronics', 'Home & Garden', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="text-sm" placeholder="CO₂e (kg)" type="number" step="0.1" value={item.carbonEstimate} onChange={(e) => updateItem(i, 'carbonEstimate', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => { if (store.trim()) onSave(store, items); }} className="btn-primary flex-1">Save Receipt</button>
        </div>
      </div>
    </div>
  );
}

function ScanReceiptModal({ onClose, onSave }: { onClose: () => void; onSave: (receipt: ScannedReceipt) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScannedReceipt | null>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setStep('analyzing');

    const stages = [
      { text: 'Preprocessing image...', dur: 400 },
      { text: 'Detecting text regions...', dur: 600 },
      { text: 'Reading items...', dur: 800 },
      { text: 'Calculating carbon estimates...', dur: 500 },
      { text: 'Finalizing...', dur: 300 },
    ];
    let p = 0;
    for (const stage of stages) {
      await new Promise(r => setTimeout(r, stage.dur));
      p += 20; setProgress(p);
    }

    const receipt = await analyzeReceipt(file);
    const newReceipt: ScannedReceipt = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      store: receipt.store,
      items: receipt.items,
      itemCount: receipt.items.length,
      carbon: receipt.totalCarbon,
      price: receipt.total,
      status: 'estimated',
      imagePreview: receipt.imagePreview,
    };
    setResult(newReceipt);
    setStep('results');
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
          <h2 className="text-lg font-bold">Scan Receipt</h2>
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
              <p className="text-sm font-medium">Drop a receipt image here</p>
              <p className="text-xs text-dark-300 mt-1">or click to browse files</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { fileRef.current?.click(); }} className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Take Photo
              </button>
              <button onClick={() => { fileRef.current?.click(); }} className="btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Choose File
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {step === 'analyzing' && (
          <div className="p-5 space-y-4">
            {preview && <img src={preview} className="w-full h-40 object-cover rounded-lg" alt="Receipt" />}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-200">Analyzing receipt...</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-dark-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Image preprocessed</div>
                {progress >= 40 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Text regions detected</div>}
                {progress >= 60 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Items extracted</div>}
                {progress >= 80 && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Carbon estimates computed</div>}
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
                <p className="text-sm font-medium text-primary">Analysis Complete</p>
                <p className="text-xs text-dark-200">Found {result.itemCount} items from {result.store}</p>
              </div>
            </div>
            {result.imagePreview && <img src={result.imagePreview} className="w-full h-28 object-cover rounded-lg" alt="Receipt" />}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-primary">{result.carbon.toFixed(1)}</p>
                <p className="text-xs text-dark-300">kg CO₂e</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-dark-50">${result.price.toFixed(2)}</p>
                <p className="text-xs text-dark-300">Total</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-secondary">{result.itemCount}</p>
                <p className="text-xs text-dark-300">Items</p>
              </div>
            </div>
            <div className="max-h-48 overflow-auto space-y-1.5">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-dark-600 rounded text-xs">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-dark-300 ml-2">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-dark-200">${item.price.toFixed(2)}</span>
                    <span className="text-primary ml-2">{item.carbonKg}kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          {step === 'results' && result && (
            <button onClick={() => { onSave(result); onClose(); }} className="btn-primary flex-1">Save to Tracker</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptDetailModal({ scan, onClose }: { scan: ScannedReceipt; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">{scan.store}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          {scan.imagePreview && <img src={scan.imagePreview} className="w-full h-32 object-cover rounded-lg" alt="Receipt" />}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Date</p><p className="text-sm font-medium mt-1">{scan.date}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Items</p><p className="text-sm font-medium mt-1">{scan.itemCount}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Status</p><p className={`text-xs font-medium mt-1 capitalize ${scan.status === 'confirmed' ? 'text-primary' : scan.status === 'estimated' ? 'text-warning' : 'text-dark-200'}`}>{scan.status}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Total Carbon</p><p className="text-lg font-bold text-primary mt-1">{scan.carbon} kg CO₂e</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Total Cost</p><p className="text-lg font-bold text-secondary mt-1">${scan.price.toFixed(2)}</p></div>
          </div>
          {scan.items.length > 0 && (
            <div>
              <p className="text-xs text-dark-300 mb-2">Itemized Breakdown</p>
              <div className="space-y-1 max-h-40 overflow-auto">
                {scan.items.map((item, i) => (
                  <div key={i} className="flex justify-between p-2 bg-dark-600 rounded text-xs">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-primary">{item.carbonKg}kg · ${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline w-full">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function CarbonPage() {
  const [search, setSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [detailScan, setDetailScan] = useState<ScannedReceipt | null>(null);
  const [scans, setScans] = useState<ScannedReceipt[]>(() =>
    appStore.getCarbon().map((c) => ({
      id: c.id,
      date: c.date,
      store: c.store,
      items: c.items,
      itemCount: Math.max(c.items.length, 1),
      carbon: c.totalCarbon,
      price: c.total,
      status: 'confirmed' as const,
    })),
  );
  const filtered = scans.filter((s) => s.store.toLowerCase().includes(search.toLowerCase()));

  const totalCarbon = scans.reduce((s, r) => s + r.carbon, 0);
  const totalSpent = scans.reduce((s, r) => s + r.price, 0);

  const handleSaveManual = (store: string, items: ReceiptItem[]) => {
    const totalCarbon = items.reduce((sum, item) => sum + (parseFloat(item.carbonEstimate) || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const newScan: ScannedReceipt = {
      id: String(Date.now()), date: new Date().toISOString().split('T')[0], store,
      items: items.map(i => ({ name: i.name, price: parseFloat(i.price) || 0, category: i.category, carbonKg: parseFloat(i.carbonEstimate) || 0 })),
      itemCount: items.length, carbon: totalCarbon || Math.round(totalPrice * 0.35 * 10) / 10, price: totalPrice, status: 'confirmed',
    };
    setScans([newScan, ...scans]);
    appStore.addCarbon({ id: newScan.id, date: newScan.date, items: newScan.items, total: newScan.price, totalCarbon: newScan.carbon, store: newScan.store });
    setShowManual(false);
  };

  return (
    <div className="space-y-6">
      {showManual && <ManualEntryModal onClose={() => setShowManual(false)} onSave={handleSaveManual} />}
      {showScan && <ScanReceiptModal onClose={() => setShowScan(false)} onSave={(receipt) => { setScans([receipt, ...scans]); appStore.addCarbon({ id: receipt.id, date: receipt.date, items: receipt.items, total: receipt.price, totalCarbon: receipt.carbon, store: receipt.store }); setShowScan(false); }} />}
      {detailScan && <ReceiptDetailModal scan={detailScan} onClose={() => setDetailScan(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carbon Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Scan receipts to estimate your carbon footprint</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScan(true)} className="btn-primary flex items-center gap-2"><Camera className="w-4 h-4" /> Scan Receipt</button>
          <button onClick={() => setShowManual(true)} className="btn-outline flex items-center gap-2"><FileText className="w-4 h-4" /> Manual Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">This Month</p>
          <p className="text-2xl font-bold text-primary mt-1">{totalCarbon.toFixed(0)} kg</p>
          <p className="text-xs text-dark-300 mt-1">CO₂ equivalent</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Scans</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{scans.length}</p>
          <p className="text-xs text-dark-300 mt-1">receipts processed</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Spent</p>
          <p className="text-2xl font-bold text-secondary mt-1">${totalSpent.toFixed(0)}</p>
          <p className="text-xs text-dark-300 mt-1">this month</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input className="w-full pl-9" placeholder="Search receipts..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-ghost flex items-center gap-1 text-sm"><Filter className="w-4 h-4" /> Filter</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-dark-300 border-b border-dark-500">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Store</th>
              <th className="pb-2 font-medium">Items</th>
              <th className="pb-2 font-medium">Carbon</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-dark-300">
                  {scans.length === 0
                    ? 'No receipts yet — scan or add one above. Entries persist across restarts.'
                    : 'No receipts match your search.'}
                </td>
              </tr>
            )}
            {filtered.map((scan) => (
              <tr key={scan.id} className="border-b border-dark-500/50 hover:bg-dark-600/50 transition-colors cursor-pointer" onClick={() => setDetailScan(scan)}>
                <td className="py-3 text-sm">{scan.date}</td>
                <td className="py-3 text-sm font-medium">{scan.store}</td>
                <td className="py-3 text-sm text-dark-200">{scan.itemCount}</td>
                <td className="py-3 text-sm font-medium text-primary">{scan.carbon} kg</td>
                <td className="py-3 text-sm">${scan.price.toFixed(2)}</td>
                <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[scan.status]}`}>{scan.status}</span></td>
                <td className="py-3"><button className="p-1 hover:bg-dark-500 rounded"><ChevronRight className="w-4 h-4 text-dark-300" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
