import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  Leaf,
  Sprout,
  HeartPulse,
  X,
  Zap,
  Trash2,
  Settings,
  Menu,
  ScanSearch,
} from 'lucide-react';
import WasteAnalyzerPage from './pages/WasteAnalyzer';
import DashboardPage from './pages/Dashboard';
import CarbonPage from './pages/Carbon';
import EnergyPage from './pages/Energy';
import FoodWastePage from './pages/FoodWaste';
import SettingsPage from './pages/Settings';
import AgriSensePage from './pages/AgriSense';
import PlantSensePage from './pages/PlantSense';
import ThemeToggle from './components/ui/ThemeToggle';
import { store } from './lib/store';
import softwareLogo from './assets/logo.png';

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  desc?: string;
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'AI Tools',
    items: [
      { path: '/analyzer', label: 'AI Waste Analyzer', icon: ScanSearch, desc: 'Vision scan' },
      { path: '/agrisense', label: 'AgriSense', icon: Sprout, desc: 'Crop advisor' },
      { path: '/plantsense', label: 'PlantSense', icon: HeartPulse, desc: 'Plant doctor' },
    ],
  },
  {
    title: 'Sustainability Tracker',
    items: [
      { path: '/carbon', label: 'Carbon', icon: Leaf },
      { path: '/energy', label: 'Energy', icon: Zap },
      { path: '/food-waste', label: 'Food Waste', icon: Trash2 },
    ],
  },
  {
    title: 'System',
    items: [{ path: '/settings', label: 'Settings', icon: Settings }],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

function Sidebar() {
  const [profile, setProfile] = useState(() => store.getProfile());

  useEffect(() => {
    const h = () => setProfile(store.getProfile());
    window.addEventListener('profile-updated', h as EventListener);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('profile-updated', h as EventListener);
      window.removeEventListener('storage', h);
    };
  }, []);

  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'SV';

  return (
    <aside className="w-64 h-screen bg-dark-700 border-r border-dark-500 flex flex-col shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-dark-500">
        <img src={softwareLogo} alt="Sustainability Hub logo" className="w-10 h-10 rounded-xl object-cover" />
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-dark-50">Sustainability</h1>
          <p className="text-xs text-dark-200">Hub Desktop</p>
        </div>
      </div>
      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si === 0 ? '' : 'pt-4'}>
            {section.title && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-dark-300 select-none">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
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
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-500">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{initials}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-50 truncate">{profile.name}</p>
            <p className="text-xs text-dark-200 truncate">{profile.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

type Toast = {
  id: string;
  kind: 'waste' | 'agri' | 'error';
  title: string;
  detail: string;
  target: string;
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const headerTitle =
    allNavItems.find((n) => n.path === location.pathname)?.label || 'Sustainability Hub';

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ kind: 'waste' | 'agri'; title: string; detail: string; target: string; ok: boolean }>;
      const d = ce.detail;
      if (!d) return;
      // If user is already on the target page, let the page auto-jump to results instead of toasting
      if (location.pathname === d.target && d.ok) return;
      const toast: Toast = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        kind: d.ok ? d.kind : 'error',
        title: d.ok ? d.title : 'Analysis failed',
        detail: d.detail,
        target: d.target,
      };
      setToasts((t) => [...t, toast]);
      // auto-dismiss
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), 6000);
    };
    window.addEventListener('analysis-complete', handler as EventListener);
    return () => window.removeEventListener('analysis-complete', handler as EventListener);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden max-w-[100vw]">
      {sidebarOpen && <Sidebar />}
      <main className="flex-1 min-w-0 overflow-auto overflow-x-hidden max-w-full">
        <header className="h-12 border-b border-dark-500 bg-dark-700/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10 min-w-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 mr-3 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-semibold text-dark-100 truncate">{headerTitle}</h2>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6 min-w-0 max-w-full overflow-x-hidden page-wrap">
          <div key={location.pathname} className="animate-pageIn min-w-0 max-w-full overflow-x-hidden">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/analyzer" element={<WasteAnalyzerPage />} />
              <Route path="/agrisense" element={<AgriSensePage />} />
              <Route path="/plantsense" element={<PlantSensePage />} />
              <Route path="/carbon" element={<CarbonPage />} />
              <Route path="/energy" element={<EnergyPage />} />
              <Route path="/food-waste" element={<FoodWastePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Bottom-right analysis toasts */}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none max-w-[360px] w-[calc(100vw-32px)] sm:w-[360px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3 rounded-xl border shadow-xl backdrop-blur bg-dark-700/95 border-dark-500 animate-toastIn"
          >
            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${t.kind === 'error' ? 'bg-error/15 text-error' : t.kind === 'agri' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success'}`}>
              {t.kind === 'error' ? <AlertTriangle className="w-4 h-4" /> : t.kind === 'agri' ? <Sprout className="w-4 h-4" /> : <ScanSearch className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-dark-50 flex items-center gap-1.5">
                {t.kind === 'error' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-success" />}
                {t.title}
              </p>
              <p className="text-[11px] leading-snug text-dark-200 mt-0.5 line-clamp-2">{t.detail}</p>
              {t.kind !== 'error' && (
                <button
                  onClick={() => {
                    setToasts((prev) => prev.filter((x) => x.id !== t.id));
                    navigate(t.target);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-light transition-colors"
                >
                  View results →
                </button>
              )}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="shrink-0 p-1 rounded-md hover:bg-dark-600 text-dark-300 hover:text-dark-50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
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
