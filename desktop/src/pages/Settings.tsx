import { useEffect, useState } from 'react';
import {
  User, Home, Bell, Shield, KeyRound, Eye, EyeOff,
  CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Sprout, ScanSearch, Loader2, Save,
  Trash2, Database, Download, Users, LogOut,
} from 'lucide-react';
import { fetchAISettings, updateAISettings, type AISettingsResponse } from '@/lib/api';
import { store, type ProfileData, type HouseholdData, type NotificationPrefs } from '@/lib/store';
import { listAccounts, deleteAccount, clearAllAccounts, getCurrentUser, logout, type AuthUser } from '@/lib/auth';

type Tab = 'ai' | 'accounts' | 'profile' | 'household' | 'notifications' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');

  // AI settings state
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AISettingsResponse | null>(null);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const [aiSaveError, setAiSaveError] = useState<string | null>(null);

  // Profile / Household / Notifications — persisted to localStorage via store
  const [profile, setProfile] = useState<ProfileData>(() => store.getProfile());
  const [household, setHousehold] = useState<HouseholdData>(() => store.getHousehold());
  const [notifs, setNotifs] = useState<NotificationPrefs>(() => store.getNotifications());
  const [profileSaved, setProfileSaved] = useState(false);
  const [householdSaved, setHouseholdSaved] = useState(false);

  // Accounts — well-organized local account saving system
  const [accounts, setAccounts] = useState<AuthUser[]>(() => listAccounts());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  function refreshAccounts() {
    setAccounts(listAccounts());
    setCurrentUser(getCurrentUser());
  }

  // Data tab counts
  const [counts, setCounts] = useState({ scans: 0, agri: 0, waste: 0, carbon: 0, energy: 0 });

  function refreshCounts() {
    setCounts({
      scans: store.getWasteHistory().length,
      agri: store.getAgriHistory().length,
      waste: store.getWaste().length,
      carbon: store.getCarbon().length,
      energy: store.getEnergy().length,
    });
  }

  async function loadAI() {
    setAiLoading(true); setAiError(null);
    try {
      const data = await fetchAISettings();
      setAiData(data);
      setProvider((data.ai_provider as 'gemini' | 'openai') || 'gemini');
      setGeminiModel(data.gemini_model || 'gemini-3.6-flash');
      setOpenaiModel(data.openai_model || 'gpt-4o-mini');
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Failed to load AI settings.');
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => { loadAI(); refreshCounts(); refreshAccounts(); }, []);
  useEffect(() => { if (activeTab === 'ai') loadAI(); if (activeTab === 'data') refreshCounts(); if (activeTab === 'accounts') refreshAccounts(); }, [activeTab]);
  useEffect(() => {
    const h = () => refreshAccounts();
    window.addEventListener('auth-changed', h as EventListener);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener('auth-changed', h as EventListener); window.removeEventListener('storage', h); };
  }, []);

  // Keep profile sync with sidebar (dispatch event)
  function saveProfile() {
    if (!profile.name.trim() || !profile.email.trim()) {
      alert('Name and email are required.');
      return;
    }
    store.setProfile(profile);
    setProfileSaved(true);
    window.dispatchEvent(new CustomEvent('profile-updated'));
    setTimeout(() => setProfileSaved(false), 2000);
  }
  function saveHousehold() {
    store.setHousehold(household);
    setHouseholdSaved(true);
    setTimeout(() => setHouseholdSaved(false), 2000);
  }
  function toggleNotif(key: keyof NotificationPrefs) {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    store.setNotifications(next);
  }

  async function handleSaveAI() {
    setSavingAI(true); setAiSaveError(null); setAiSaved(false);
    try {
      const payload: Record<string, string> = {};
      if (geminiKey.trim()) payload.gemini_api_key = geminiKey.trim();
      if (openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
      payload.gemini_model = geminiModel.trim();
      payload.openai_model = openaiModel.trim();
      payload.ai_provider = provider;
      const updated = await updateAISettings(payload);
      setAiData(updated);
      setGeminiKey('');
      setOpenaiKey('');
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 3500);
    } catch (e) {
      setAiSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSavingAI(false);
    }
  }

  async function handleClearKey(which: 'gemini' | 'openai') {
    if (!confirm(`Clear the stored ${which === 'gemini' ? 'Gemini' : 'OpenAI'} API key? Analyses will fail until a new key is added.`)) return;
    setSavingAI(true);
    try {
      const payload: Record<string, string> = {};
      if (which === 'gemini') payload.gemini_api_key = '';
      else payload.openai_api_key = '';
      const updated = await updateAISettings(payload);
      setAiData(updated);
    } catch (e) {
      setAiSaveError(e instanceof Error ? e.message : 'Clear failed');
    } finally {
      setSavingAI(false);
    }
  }

  function initials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'SV';
  }

  return (
    <div className="max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Settings</h1>
        <p className="text-dark-200 text-sm mt-1">Manage your AI keys, profile and app data</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="w-full lg:w-56 space-y-1 shrink-0">
          {[
            { key: 'ai' as Tab, label: 'AI Configuration', icon: KeyRound },
            { key: 'accounts' as Tab, label: 'Accounts', icon: Users },
            { key: 'profile' as Tab, label: 'Profile', icon: User },
            { key: 'household' as Tab, label: 'Household', icon: Home },
            { key: 'notifications' as Tab, label: 'Notifications', icon: Bell },
            { key: 'data' as Tab, label: 'Data & Privacy', icon: Database },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary/15 text-primary' : 'text-dark-200 hover:bg-dark-600 hover:text-dark-50'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.key === 'ai' && aiData && (
                <span className={`ml-auto w-2 h-2 rounded-full ${aiData.ai_configured ? 'bg-success' : 'bg-error animate-pulse'}`} />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-pageIn">
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${aiData?.ai_configured ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                {aiData?.ai_configured ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${aiData?.ai_configured ? 'text-success' : 'text-warning'}`}>
                    {aiLoading ? 'Checking AI configuration…' : aiData?.ai_configured ? `AI ready — ${aiData.ai_provider} · ${aiData.ai_provider === 'openai' ? aiData.openai_model : aiData.gemini_model}` : 'AI not configured — analyses will fail'}
                  </p>
                  <p className="text-xs text-dark-200 mt-1 leading-relaxed">
                    Keys are used by <strong>AI Waste Analyzer, AgriSense and PlantSense</strong>. They are stored safely on this device and sent directly to Google/OpenAI for each analysis — never through any local server, and never shown in full again.
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${aiData?.ai_configured ? 'bg-success/15 border-success/30 text-success' : 'bg-warning/15 border-warning/30 text-warning'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${aiData?.ai_configured ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                  {aiLoading ? '…' : aiData?.ai_configured ? 'Configured' : 'Missing key'}
                </span>
              </div>

              {aiError && (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
                  {aiError}
                </div>
              )}

              <div className="card-elevated p-5 space-y-5 min-w-0">
                <div>
                  <h3 className="text-sm font-semibold text-dark-50 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> AI Provider
                  </h3>
                  <p className="text-xs text-dark-300 mt-1">Choose which model the analyzers call. You can configure both keys and switch anytime.</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {(['gemini', 'openai'] as const).map((p) => (
                      <button key={p} onClick={() => setProvider(p)}
                        className={`relative p-3 rounded-xl border text-left transition-all ${provider === p ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20' : 'bg-dark-700 border-dark-500 hover:border-primary/30'}`}>
                        <p className="text-sm font-semibold text-dark-50 flex items-center gap-1.5">
                          {p === 'gemini' ? <Sparkles className="w-4 h-4 text-primary" /> : <Sprout className="w-4 h-4 text-primary" />}
                          {p === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                          {provider === p && <CheckCircle2 className="w-3.5 h-3.5 text-success ml-auto" />}
                        </p>
                        <p className="text-[11px] text-dark-300 mt-1 leading-snug">
                          {p === 'gemini' ? 'Fast, cost-effective vision (recommended).' : 'GPT-4o vision — strong reasoning.'}
                        </p>
                        <p className="text-[11px] font-mono text-dark-200 mt-2">
                          {p === 'gemini' ? (aiData?.gemini_model ?? geminiModel) : (aiData?.openai_model ?? openaiModel)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-dark-500 bg-dark-700/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-dark-50 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Google Gemini
                      {aiData?.gemini_configured ? <span className="px-2 py-0.5 rounded-full bg-success/15 border border-success/30 text-[10px] font-medium text-success">Configured</span> : <span className="px-2 py-0.5 rounded-full bg-dark-600 border border-dark-400 text-[10px] text-dark-200">Not set</span>}
                    </h4>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-light">
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {aiData?.gemini_api_key_masked && (
                    <p className="text-[11px] font-mono text-dark-200 bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5">
                      Current: {aiData.gemini_api_key_masked}
                    </p>
                  )}
                  <div className="relative">
                    <input
                      type={showGemini ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder={aiData?.gemini_api_key_masked ? 'Leave blank to keep existing • or paste a new key (AIza…)' : 'Paste Gemini API key (AIza…)'}
                      className="w-full pr-20 font-mono text-sm"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
                      <button type="button" onClick={() => setShowGemini((v) => !v)} className="p-1.5 rounded-md hover:bg-dark-600 text-dark-300 hover:text-dark-50">
                        {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {aiData?.gemini_configured && (
                        <button type="button" onClick={() => handleClearKey('gemini')} className="text-[11px] px-2 py-1 rounded-md bg-error/10 hover:bg-error/20 text-error border border-error/20">Clear</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-dark-200">Model</label>
                    <input value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} placeholder="gemini-3.6-flash" className="w-full mt-1 font-mono text-sm" />
                    <p className="text-[11px] text-dark-300 mt-1">Use <code className="font-mono">gemini-2.0-flash</code> or <code>gemini-1.5-flash</code> if 3.6 is unavailable.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-dark-500 bg-dark-700/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-dark-50 flex items-center gap-2">
                      <ScanSearch className="w-4 h-4 text-primary" /> OpenAI
                      {aiData?.openai_configured ? <span className="px-2 py-0.5 rounded-full bg-success/15 border border-success/30 text-[10px] font-medium text-success">Configured</span> : <span className="px-2 py-0.5 rounded-full bg-dark-600 border border-dark-400 text-[10px] text-dark-200">Not set</span>}
                    </h4>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-light">
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {aiData?.openai_api_key_masked && (
                    <p className="text-[11px] font-mono text-dark-200 bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5">
                      Current: {aiData.openai_api_key_masked}
                    </p>
                  )}
                  <div className="relative">
                    <input
                      type={showOpenai ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder={aiData?.openai_api_key_masked ? 'Leave blank to keep existing • or paste a new key (sk-…)' : 'Paste OpenAI API key (sk-…)'}
                      className="w-full pr-20 font-mono text-sm"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
                      <button type="button" onClick={() => setShowOpenai((v) => !v)} className="p-1.5 rounded-md hover:bg-dark-600 text-dark-300 hover:text-dark-50">
                        {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {aiData?.openai_configured && (
                        <button type="button" onClick={() => handleClearKey('openai')} className="text-[11px] px-2 py-1 rounded-md bg-error/10 hover:bg-error/20 text-error border border-error/20">Clear</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-dark-200">Model</label>
                    <input value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} placeholder="gpt-4o-mini" className="w-full mt-1 font-mono text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={handleSaveAI} disabled={savingAI} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                    {savingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : aiSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {savingAI ? 'Saving…' : aiSaved ? 'Saved!' : 'Save AI Keys'}
                  </button>
                  <span className="text-xs text-dark-300">
                    {aiSaved ? 'Keys saved on this device. Your analyses will call the AI provider directly — no server needed.' : 'Waste Analyzer, AgriSense and PlantSense all use these keys.'}
                  </span>
                </div>
                {aiSaveError && <div className="rounded-lg border border-error/30 bg-error/10 p-2.5 text-sm text-error">{aiSaveError}</div>}
                {aiSaved && (
                  <div className="rounded-lg border border-success/30 bg-success/10 p-2.5 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Keys saved on this device. Photos are analysed directly by the AI using your key — works on this app wherever it runs.
                  </div>
                )}
              </div>

              <div className="card p-4 bg-dark-700/30 border-dashed">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-dark-300">Where to get keys</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-dark-200 list-disc list-inside">
                  <li><strong>Gemini</strong> — <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" /></a> (free tier available)</li>
                  <li><strong>OpenAI</strong> — <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">platform.openai.com/api-keys <ExternalLink className="w-3 h-3" /></a></li>
                </ul>
                <p className="text-[11px] text-dark-300 mt-2">Keys are stored on this device and sent directly to Google/OpenAI only when you run an analysis. They never pass through our servers.</p>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-4 animate-pageIn">
              <div className="card-elevated p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-dark-50 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Saved Accounts</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-dark-600 border border-dark-400 text-dark-200">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-dark-300">All accounts are stored locally on this device (SHA-256 for local passwords). No cloud sync until OAuth is configured.</p>
                {currentUser && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">{initials(currentUser.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark-50 truncate">{currentUser.name} <span className="text-xs font-normal text-primary">· Active</span></p>
                      <p className="text-xs text-dark-200 truncate">{currentUser.email} · {currentUser.provider}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-success/15 border border-success/30 text-success">Signed in</span>
                  </div>
                )}
                {accounts.length === 0 ? (
                  <p className="text-sm text-dark-300 text-center py-6">No accounts yet. Create one from the login screen.</p>
                ) : (
                  <div className="space-y-2">
                    {accounts.map(acc => (
                      <div key={acc.id} className={`flex items-center gap-3 p-3 rounded-xl border ${currentUser?.id === acc.id ? 'bg-primary/5 border-primary/20' : 'bg-dark-700 border-dark-500'}`}>
                        <div className="w-9 h-9 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center text-dark-50 text-sm font-bold shrink-0">{initials(acc.name)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-dark-50 truncate">{acc.name}</p>
                          <p className="text-xs text-dark-200 truncate">{acc.email}</p>
                          <p className="text-[11px] text-dark-300">{acc.provider} · {new Date(acc.createdAt).toLocaleDateString()} {currentUser?.id === acc.id ? '· Active' : ''}</p>
                        </div>
                        <button onClick={() => { if (!confirm(`Delete account ${acc.email}?`)) return; deleteAccount(acc.id); refreshAccounts(); }} className="p-2 rounded-lg hover:bg-error/10 text-dark-300 hover:text-error" title="Delete account">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dark-500">
                  <button onClick={() => { if (!confirm('Sign out current account?')) return; logout(); refreshAccounts(); }} className="btn-outline inline-flex items-center gap-2 !border-amber-300 !text-amber-700 hover:!bg-amber-50">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                  <button onClick={() => { if (!confirm('Delete ALL saved accounts? This cannot be undone.')) return; clearAllAccounts(); refreshAccounts(); }} className="btn-outline inline-flex items-center gap-2 !border-error/30 !text-error hover:!bg-error/10">
                    <Trash2 className="w-4 h-4" /> Clear all accounts
                  </button>
                </div>
                <p className="text-[11px] text-dark-300">Storage keys: <code className="font-mono bg-dark-600 px-1 py-0.5 rounded">sh_auth_users</code> + <code className="font-mono bg-dark-600 px-1 py-0.5 rounded">sh_auth_session</code> in localStorage. Google/Microsoft OAuth will be enabled when you set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> / <code className="font-mono">VITE_MICROSOFT_CLIENT_ID</code>.</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card-elevated p-5 space-y-4 animate-pageIn">
              <h3 className="text-sm font-semibold text-dark-50">Profile</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">{initials(profile.name)}</div>
                <div className="min-w-0">
                  <p className="font-medium text-dark-50 truncate">{profile.name}</p>
                  <p className="text-sm text-dark-200 truncate">{profile.email}</p>
                  <p className="text-xs text-dark-300">{profile.location} · {profile.diet}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Full Name *</label>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Email *</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Location</label>
                  <input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Dietary Preference</label>
                  <select value={profile.diet} onChange={(e) => setProfile({ ...profile, diet: e.target.value })} className="w-full">
                    <option>Omnivore</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Pescatarian</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={saveProfile} className={`btn-primary inline-flex items-center gap-2 ${profileSaved ? '!bg-success' : ''}`}>
                  {profileSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {profileSaved ? 'Saved!' : 'Save Profile'}
                </button>
                <span className="text-xs text-dark-300">Shown in the sidebar and on reports.</span>
              </div>
            </div>
          )}

          {activeTab === 'household' && (
            <div className="card-elevated p-5 space-y-4 animate-pageIn">
              <h3 className="text-sm font-semibold text-dark-50">Household</h3>
              <p className="text-xs text-dark-300">Used to personalize Energy and Carbon estimates.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Household Size</label>
                  <input type="number" min={1} max={20} value={household.size} onChange={(e) => setHousehold({ ...household, size: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Home Type</label>
                  <select value={household.homeType} onChange={(e) => setHousehold({ ...household, homeType: e.target.value })} className="w-full">
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Square Footage</label>
                  <input type="number" min={100} step={100} value={household.sqft} onChange={(e) => setHousehold({ ...household, sqft: Math.max(100, parseInt(e.target.value) || 0) })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Heating Type</label>
                  <select value={household.heating} onChange={(e) => setHousehold({ ...household, heating: e.target.value })} className="w-full">
                    <option>Natural Gas</option>
                    <option>Electric</option>
                    <option>Oil</option>
                    <option>Heat Pump</option>
                  </select>
                </div>
              </div>
              <button onClick={saveHousehold} className={`btn-primary inline-flex items-center gap-2 ${householdSaved ? '!bg-success' : ''}`}>
                {householdSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {householdSaved ? 'Saved!' : 'Save Household'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card-elevated p-5 space-y-4 animate-pageIn">
              <h3 className="text-sm font-semibold text-dark-50">Notifications</h3>
              <p className="text-xs text-dark-300">Local reminders — no emails are sent. Toggles are saved on this device.</p>
              {[
                { key: 'weekly' as const, label: 'Weekly summary', desc: 'Show a weekly summary card on Dashboard' },
                { key: 'streak' as const, label: 'Streak reminders', desc: 'Highlight streak at risk on Food Waste tracker' },
                { key: 'carbon' as const, label: 'Carbon budget alerts', desc: 'Warn when monthly carbon estimate is high' },
                { key: 'tips' as const, label: 'Energy-saving tips', desc: 'Show personalized tips on Energy page' },
                { key: 'badges' as const, label: 'Achievement toasts', desc: 'Bottom-right toasts when analyses finish' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-dark-500 bg-dark-700">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-dark-50">{item.label}</p>
                    <p className="text-xs text-dark-300 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={notifs[item.key]} onChange={() => toggleNotif(item.key)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-dark-400 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4 animate-pageIn">
              <div className="card-elevated p-5 space-y-4">
                <h3 className="text-sm font-semibold text-dark-50 flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Data & Privacy</h3>
                <p className="text-xs text-dark-300">All data — including your AI keys — is stored locally on this device. No cloud sync, no server required.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Waste scans', value: counts.scans },
                    { label: 'Agri checks', value: counts.agri },
                    { label: 'Food logs', value: counts.waste },
                    { label: 'Carbon entries', value: counts.carbon },
                    { label: 'Energy bills', value: counts.energy },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-dark-500 bg-dark-700 p-3 text-center">
                      <p className="text-lg font-bold text-dark-50">{s.value}</p>
                      <p className="text-[11px] uppercase tracking-wide text-dark-300">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <h4 className="text-sm font-semibold text-dark-50">Manage data</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (!confirm('Clear all Waste Analyzer history? This cannot be undone.')) return;
                      localStorage.removeItem('sh_waste_history');
                      refreshCounts();
                    }}
                    className="btn-outline inline-flex items-center gap-2 !border-dark-400 !text-dark-200 hover:!bg-dark-600"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Waste History
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm('Clear all AgriSense history?')) return;
                      localStorage.removeItem('sh_agri_history');
                      refreshCounts();
                    }}
                    className="btn-outline inline-flex items-center gap-2 !border-dark-400 !text-dark-200 hover:!bg-dark-600"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Agri History
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({
                        profile: store.getProfile(),
                        household: store.getHousehold(),
                        notifications: store.getNotifications(),
                        wasteHistory: store.getWasteHistory(),
                        agriHistory: store.getAgriHistory(),
                        waste: store.getWaste(),
                        carbon: store.getCarbon(),
                        energy: store.getEnergy(),
                      }, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `sustainability-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Backup (JSON)
                  </button>
                </div>
                <div className="pt-3 border-t border-dark-500">
                  <button
                    onClick={() => {
                      if (!confirm('Reset ALL app data — profile, household, scan history, food/carbon/energy logs? This cannot be undone.')) return;
                      if (!confirm('Are you absolutely sure? Type OK to confirm.')) return;
                      store.clearAll();
                      refreshCounts();
                      // reset in-memory state
                      setProfile(store.getProfile());
                      setHousehold(store.getHousehold());
                      setNotifs(store.getNotifications());
                      alert('All local data cleared. Reloading app.');
                      location.reload();
                    }}
                    className="btn-outline inline-flex items-center gap-2 !border-error/30 !text-error hover:!bg-error/10"
                  >
                    <Trash2 className="w-4 h-4" /> Reset All Local Data
                  </button>
                  <p className="text-[11px] text-dark-300 mt-2">AI keys are not cleared by this — clear them in the AI Configuration tab if needed.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
