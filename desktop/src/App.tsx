import { useEffect, useState, Fragment } from 'react';
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
  ScanSearch,
  Download,
  Rocket,
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
import CommandPalette from './components/CommandPalette';
import { store } from './lib/store';
import softwareLogo from './assets/logo.png';
import { checkForUpdate, CURRENT_VERSION } from './lib/updater';
import { getCurrentUser, getSession } from './lib/auth';
import LoginPage from './pages/Login';
import AuthCallback from './pages/AuthCallback';

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
    title: 'ELARA Tracker',
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

function useCurrentUser() {
  const [user, setUser] = useState(() => getCurrentUser() || (store.getProfile() as any));

  useEffect(() => {
    const h = () => setUser(getCurrentUser() || (store.getProfile() as any));
    window.addEventListener('auth-changed', h as EventListener);
    window.addEventListener('profile-updated', h as EventListener);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('auth-changed', h as EventListener);
      window.removeEventListener('profile-updated', h as EventListener);
      window.removeEventListener('storage', h);
    };
  }, []);

  return user as any;
}

function LeftIsland() {
  return (
    <div className="shrink-0 h-screen sticky top-0 z-20 hidden sm:block py-4 pl-4">
      <div className="h-full w-[76px] rounded-3xl border border-white/10 bg-dark-700/80 backdrop-blur-xl shadow-2xl flex flex-col items-center py-4 overflow-y-auto">
        <img src={softwareLogo} alt="ELARA logo" title="ELARA" className="w-9 h-9 rounded-2xl object-cover shrink-0" />
        <nav className="flex-1 flex flex-col items-center justify-center gap-1 w-full px-2">
          {navSections.map((section, si) => (
            <Fragment key={si}>
              {si > 0 && <div className="w-1 h-1 rounded-full bg-dark-400/70 my-1.5 shrink-0" />}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    `p-2.5 rounded-2xl transition-all shrink-0 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                        : 'text-dark-300 hover:bg-dark-600 hover:text-dark-50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                </NavLink>
              ))}
            </Fragment>
          ))}
        </nav>
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="All systems local" />
      </div>
    </div>
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
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const displayName = (user?.name || '').trim() || 'User';
  const initials = displayName.split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('') || 'U';
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [update, setUpdate] = useState<null | { latest: string; url: string; downloadUrl: string | null }>(null);
  const [downloading, setDownloading] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const info = await checkForUpdate();
      if (!cancelled && info?.hasUpdate) setUpdate({ latest: info.latest, url: info.url, downloadUrl: info.downloadUrl });
    };
    run();
    const id = setInterval(run, 6 * 60 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const handleUpdate = async () => {
    if (!update) return;
    if (update.downloadUrl) {
      setDownloading(true);
      try {
        const { downloadUpdate } = await import('./lib/updater');
        await downloadUpdate(update.downloadUrl);
      } finally {
        setTimeout(() => setDownloading(false), 2000);
      }
    } else {
      window.open(update.url, '_blank', 'noreferrer');
    }
  };
  const headerTitle =
    allNavItems.find((n) => n.path === location.pathname)?.label || 'ELARA';

  const paletteItems = [
    ...allNavItems.map((n) => ({ label: n.label, hint: n.path, path: n.path, icon: n.icon })),
    { label: 'Scan waste now', hint: 'AI Analyzer', path: '/analyzer', icon: ScanSearch },
    { label: 'Check for updates', hint: 'Application settings', path: '/settings', icon: Rocket },
  ];

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
      <LeftIsland />
      <main className="flex-1 min-w-0 overflow-auto overflow-x-hidden max-w-full">
        <div className="flex items-center gap-3 px-6 lg:px-10 pt-5">
          <div className="flex-1 min-w-0" />
          <h2 className="font-display text-xl font-bold text-dark-50 truncate shrink-0">{headerTitle}</h2>
          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
            {update && (
              <button
                onClick={handleUpdate}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                title={update.downloadUrl ? `Download ${update.latest} — ${CURRENT_VERSION} → ${update.latest}` : `Update available: ${CURRENT_VERSION} → ${update.latest}`}
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                {downloading ? 'Downloading…' : `Update ${update.latest}`}
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => navigate('/settings')}
              title={displayName}
              className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 hover:scale-105 transition-transform"
            >
              {initials}
            </button>
          </div>
        </div>
        <div className="px-6 lg:px-10 pt-4 pb-10 min-w-0 max-w-full overflow-x-hidden page-wrap">
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
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </div>
        </div>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />

      {/* Bottom-right analysis toasts */}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none max-w-[360px] w-[calc(100vw-32px)] sm:w-[360px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3 rounded-2xl shadow-2xl backdrop-blur bg-dark-700/95 border border-transparent animate-toastIn"
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

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => !!getSession());
  useEffect(() => {
    const h = () => setAuthed(!!getSession());
    window.addEventListener('auth-changed', h as EventListener);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener('auth-changed', h as EventListener); window.removeEventListener('storage', h); };
  }, []);
  if (!authed) return <LoginPage onDone={() => setAuthed(true)} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppLayout />
      </AuthGate>
    </BrowserRouter>
  );
}
