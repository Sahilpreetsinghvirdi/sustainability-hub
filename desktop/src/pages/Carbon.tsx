import { useState } from 'react';
import { Plus, Camera, FileText, Trash2, ChevronRight, Search, Filter, X, Upload, Store, Package, DollarSign } from 'lucide-react';

const statusColors: Record<string, string> = {
  confirmed: 'bg-primary/20 text-primary',
  estimated: 'bg-warning/20 text-warning',
  draft: 'bg-dark-400 text-dark-200',
};

const CATEGORIES = ['Food & Beverage', 'Transport', 'Clothing', 'Electronics', 'Home & Garden', 'Other'];

interface ReceiptItem {
  name: string;
  category: string;
  price: string;
  carbonEstimate: string;
}

function ManualEntryModal({ onClose, onSave }: { onClose: () => void; onSave: (store: string, items: ReceiptItem[]) => void }) {
  const [store, setStore] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([{ name: '', category: 'Food & Beverage', price: '', carbonEstimate: '' }]);

  const addItem = () => setItems([...items, { name: '', category: 'Food & Beverage', price: '', carbonEstimate: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ReceiptItem, val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    setItems(updated);
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
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-dark-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-300">Item {i + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-error hover:text-error/80"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="text-sm" placeholder="Item name" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <input className="text-sm" placeholder="Price ($)" type="number" step="0.01" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="text-sm" value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="text-sm" placeholder="CO₂e (kg) - auto" type="number" step="0.1" value={item.carbonEstimate} onChange={(e) => updateItem(i, 'carbonEstimate', e.target.value)} />
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

function ScanReceiptModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">Scan Receipt</h2>
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
            <p className="text-sm font-medium">Drop a receipt image here</p>
            <p className="text-xs text-dark-300 mt-1">or click to browse files</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-400">Supports JPG, PNG, PDF</p>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ReceiptDetailModal({ scan, onClose }: { scan: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl w-full max-w-md border border-dark-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="text-lg font-bold">{scan.store}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Date</p><p className="text-sm font-medium mt-1">{scan.date}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Items</p><p className="text-sm font-medium mt-1">{scan.items}</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Carbon</p><p className="text-sm font-medium text-primary mt-1">{scan.carbon} kg CO₂e</p></div>
            <div className="bg-dark-600 rounded-lg p-3"><p className="text-xs text-dark-300">Total</p><p className="text-sm font-medium text-secondary mt-1">${scan.price.toFixed(2)}</p></div>
          </div>
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
  const [detailScan, setDetailScan] = useState<any>(null);
  const [scans, setScans] = useState(mockScans);
  const filtered = scans.filter((s) => s.store.toLowerCase().includes(search.toLowerCase()));

  const handleSaveManual = (store: string, items: ReceiptItem[]) => {
    const totalCarbon = items.reduce((sum, item) => sum + (parseFloat(item.carbonEstimate) || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const newScan = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      store,
      items: items.length,
      carbon: totalCarbon || Math.round(totalPrice * 0.35 * 10) / 10,
      price: totalPrice,
      status: 'confirmed' as const,
    };
    setScans([newScan, ...scans]);
    setShowManual(false);
  };

  const handleScanConfirm = () => {
    const newScan = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      store: 'Scanned Receipt',
      items: Math.floor(Math.random() * 15) + 3,
      carbon: Math.round((Math.random() * 40 + 5) * 10) / 10,
      price: Math.round((Math.random() * 150 + 20) * 100) / 100,
      status: 'estimated' as const,
    };
    setScans([newScan, ...scans]);
    setShowScan(false);
  };

  return (
    <div className="space-y-6">
      {showManual && <ManualEntryModal onClose={() => setShowManual(false)} onSave={handleSaveManual} />}
      {showScan && <ScanReceiptModal onClose={() => setShowScan(false)} onConfirm={handleScanConfirm} />}
      {detailScan && <ReceiptDetailModal scan={detailScan} onClose={() => setDetailScan(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carbon Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Scan receipts to estimate your carbon footprint</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScan(true)} className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Scan Receipt
          </button>
          <button onClick={() => setShowManual(true)} className="btn-outline flex items-center gap-2">
            <FileText className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">This Month</p>
          <p className="text-2xl font-bold text-primary mt-1">{scans.reduce((s, r) => s + r.carbon, 0).toFixed(0)} kg</p>
          <p className="text-xs text-dark-300 mt-1">CO₂ equivalent</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Scans</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{scans.length}</p>
          <p className="text-xs text-dark-300 mt-1">receipts processed</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Spent</p>
          <p className="text-2xl font-bold text-secondary mt-1">${scans.reduce((s, r) => s + r.price, 0).toFixed(0)}</p>
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
            {filtered.map((scan) => (
              <tr key={scan.id} className="border-b border-dark-500/50 hover:bg-dark-600/50 transition-colors cursor-pointer" onClick={() => setDetailScan(scan)}>
                <td className="py-3 text-sm">{scan.date}</td>
                <td className="py-3 text-sm font-medium">{scan.store}</td>
                <td className="py-3 text-sm text-dark-200">{scan.items}</td>
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

const mockScans = [
  { id: '1', date: '2026-08-19', store: 'Whole Foods', items: 12, carbon: 23.4, price: 67.50, status: 'confirmed' as const },
  { id: '2', date: '2026-08-17', store: "Trader Joe's", items: 8, carbon: 15.2, price: 42.30, status: 'confirmed' as const },
  { id: '3', date: '2026-08-15', store: 'Costco', items: 24, carbon: 45.8, price: 156.20, status: 'estimated' as const },
  { id: '4', date: '2026-08-12', store: 'Local Market', items: 5, carbon: 8.1, price: 23.40, status: 'draft' as const },
];
