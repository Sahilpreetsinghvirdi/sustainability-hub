import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Leaf, Zap, Trash2, Settings, Menu, X } from 'lucide-react';
import DashboardPage from './pages/Dashboard';
import CarbonPage from './pages/Carbon';
import EnergyPage from './pages/Energy';
import FoodWastePage from './pages/FoodWaste';
import SettingsPage from './pages/Settings';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/carbon', label: 'Carbon', icon: Leaf },
  { path: '/energy', label: 'Energy', icon: Zap },
  { path: '/food-waste', label: 'Food Waste', icon: Trash2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 h-screen bg-dark-700 border-r border-dark-500 flex flex-col shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-dark-500">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-dark-50">Sustainability</h1>
          <p className="text-xs text-dark-200">Hub Desktop</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-dark-200 hover:bg-dark-600 hover:text-dark-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">SV</div>
          <div>
            <p className="text-sm font-medium text-dark-50">Sahil Virdi</p>
            <p className="text-xs text-dark-200">Science Fair 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <header className="h-12 border-b border-dark-500 bg-dark-700/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 mr-3">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-sm font-semibold text-dark-100">
            {navItems.find((n) => n.path === useLocation().pathname)?.label || 'Sustainability Hub'}
          </h2>
        </header>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/carbon" element={<CarbonPage />} />
            <Route path="/energy" element={<EnergyPage />} />
            <Route path="/food-waste" element={<FoodWastePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
