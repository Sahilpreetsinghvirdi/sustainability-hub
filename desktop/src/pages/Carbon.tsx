import { useState } from 'react';
import { Plus, Camera, FileText, Trash2, ChevronRight, Search, Filter } from 'lucide-react';

const mockScans = [
  { id: '1', date: '2026-08-19', store: 'Whole Foods', items: 12, carbon: 23.4, price: 67.50, status: 'confirmed' as const },
  { id: '2', date: '2026-08-17', store: 'Trader Joe\'s', items: 8, carbon: 15.2, price: 42.30, status: 'confirmed' as const },
  { id: '3', date: '2026-08-15', store: 'Costco', items: 24, carbon: 45.8, price: 156.20, status: 'estimated' as const },
  { id: '4', date: '2026-08-12', store: 'Local Market', items: 5, carbon: 8.1, price: 23.40, status: 'draft' as const },
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-primary/20 text-primary',
  estimated: 'bg-warning/20 text-warning',
  draft: 'bg-dark-400 text-dark-200',
};

export default function CarbonPage() {
  const [search, setSearch] = useState('');
  const filtered = mockScans.filter((s) => s.store.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carbon Tracker</h1>
          <p className="text-dark-200 text-sm mt-1">Scan receipts to estimate your carbon footprint</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Scan Receipt
          </button>
          <button className="btn-outline flex items-center gap-2">
            <FileText className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">This Month</p>
          <p className="text-2xl font-bold text-primary mt-1">187 kg</p>
          <p className="text-xs text-dark-300 mt-1">CO₂ equivalent</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Scans</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{mockScans.length}</p>
          <p className="text-xs text-dark-300 mt-1">receipts processed</p>
        </div>
        <div className="card-elevated">
          <p className="text-dark-200 text-xs">Total Spent</p>
          <p className="text-2xl font-bold text-secondary mt-1">${mockScans.reduce((s, r) => s + r.price, 0).toFixed(0)}</p>
          <p className="text-xs text-dark-300 mt-1">this month</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input
              className="w-full pl-9"
              placeholder="Search receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-ghost flex items-center gap-1 text-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
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
              <tr key={scan.id} className="border-b border-dark-500/50 hover:bg-dark-600/50 transition-colors">
                <td className="py-3 text-sm">{scan.date}</td>
                <td className="py-3 text-sm font-medium">{scan.store}</td>
                <td className="py-3 text-sm text-dark-200">{scan.items}</td>
                <td className="py-3 text-sm font-medium text-primary">{scan.carbon} kg</td>
                <td className="py-3 text-sm">${scan.price.toFixed(2)}</td>
                <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[scan.status]}`}>{scan.status}</span></td>
                <td className="py-3">
                  <button className="p-1 hover:bg-dark-500 rounded"><ChevronRight className="w-4 h-4 text-dark-300" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
