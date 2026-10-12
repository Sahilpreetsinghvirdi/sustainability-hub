import { useState } from 'react';
import { Loader2, Leaf, Mail, Lock, User, ShieldCheck, Eye, EyeOff, ScanSearch, TrendingDown, Flame } from 'lucide-react';
import { login, register, loginWithGoogle, loginWithMicrosoft } from '@/lib/auth';
import softwareLogo from '@/assets/logo.png';

const HIGHLIGHTS = [
  { icon: ScanSearch, title: 'AI waste analyzer', desc: 'Photo in, materials + toxins + recyclers out.' },
  { icon: TrendingDown, title: 'Carbon & energy tracking', desc: 'Receipts, bills and footprints in one place.' },
  { icon: Flame, title: 'Streaks that stick', desc: 'Zero-waste streaks keep the habit alive.' },
];

export default function LoginPage({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBusy, setOauthBusy] = useState<null | 'google' | 'microsoft'>(null);

  async function handleOAuth(provider: 'google' | 'microsoft') {
    setError(null);
    setOauthBusy(provider);
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithMicrosoft();
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(
        msg === 'OAUTH_NO_CLIENT_ID'
          ? provider === 'google'
            ? 'Google sign-in needs a client ID first: create one in Google Cloud Console, save it in desktop/.env as VITE_GOOGLE_CLIENT_ID, and register http://localhost:1420/auth/callback as a redirect URI.'
            : 'Microsoft sign-in needs a client ID first: register an app at portal.azure.com, save it in desktop/.env as VITE_MICROSOFT_CLIENT_ID, and register http://localhost:1420/auth/callback as a redirect URI.'
          : msg,
      );
    } finally {
      setOauthBusy(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800 p-4 sm:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] rounded-3xl overflow-hidden bg-dark-700 shadow-2xl">
        {/* Brand panel */}
        <div className="hidden lg:flex relative overflow-hidden flex-col p-9 bg-gradient-to-br from-zinc-950 via-[#0B0B0D] to-[#141417]">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: 'radial-gradient(600px 320px at 50% 0%, rgba(255,255,255,0.10), transparent 70%), radial-gradient(500px 300px at 50% 100%, rgba(255,255,255,0.05), transparent 70%)' }}
          />
          <div className="relative flex-1 flex flex-col items-center justify-center text-center py-6">
            <img src={softwareLogo} alt="ELARA logo" className="w-20 h-20 rounded-[28px] object-cover shadow-2xl" />
            <p className="font-display text-4xl font-bold tracking-wide text-white mt-4">ELARA</p>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-[260px] leading-relaxed">Environmental Learning, Analysis and Resource Awareness</p>
            <div className="flex items-center gap-2.5 my-5 w-full max-w-[240px]">
              <div className="h-px flex-1 bg-white/15" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <div className="h-px flex-1 bg-white/15" />
            </div>
            <p className="font-display text-lg font-bold text-white">Know your waste. Change the planet.</p>
            <p className="text-[13px] text-zinc-400 mt-2 max-w-[320px] leading-relaxed">
              Snap anything you throw away — ELARA identifies materials, flags toxins and tells you exactly where it should go.
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full mt-6">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-2 py-3.5 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <h.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-semibold text-white leading-tight">{h.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative text-[11px] text-zinc-500 text-center">ELARA · v1.6.0</div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center p-6 sm:p-9 bg-dark-700">
          <div className="w-full max-w-[400px]">
            <div className="text-center mb-5 lg:hidden">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 mb-2">
                <img src={softwareLogo} alt="logo" className="w-8 h-8 rounded-xl object-cover" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-wide text-dark-50">ELARA</h1>
              <p className="text-[11px] text-dark-200 mt-1">Environmental Learning, Analysis and Resource Awareness</p>
            </div>
            <div className="hidden lg:block mb-5">
              <h2 className="font-display text-xl font-bold text-dark-50">{mode === 'login' ? 'Welcome back' : 'Join ELARA'}</h2>
              <p className="text-sm text-dark-200 mt-1 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-primary" /> {mode === 'login' ? 'Sign in to continue' : 'Create your local account'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-dark-600/60">
                <button onClick={() => setMode('login')} className={`py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'login' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-dark-200 hover:text-dark-50'}`}>Sign in</button>
                <button onClick={() => setMode('register')} className={`py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'register' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-dark-200 hover:text-dark-50'}`}>Create account</button>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={oauthBusy !== null || loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-zinc-800 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-60"
                >
                  {oauthBusy === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  )}
                  <span>{oauthBusy === 'google' ? 'Connecting to Google…' : 'Continue with Google'}</span>
                </button>
                <button
                  onClick={() => handleOAuth('microsoft')}
                  disabled={oauthBusy !== null || loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-zinc-800 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-60"
                >
                  {oauthBusy === 'microsoft' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#F25022" d="M1 1h10v10H1z" /><path fill="#7FBA00" d="M12 1h10v10H12z" /><path fill="#00A4EF" d="M1 12h10v10H1z" /><path fill="#FFB900" d="M12 12h10v10H12z" /></svg>
                  )}
                  <span>{oauthBusy === 'microsoft' ? 'Connecting to Microsoft…' : 'Continue with Microsoft'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-dark-500/60" />
                <span className="text-xs text-dark-300">or</span>
                <div className="h-px flex-1 bg-dark-500/60" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-dark-200 mb-1 block">Full name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full pl-9 rounded-xl" required={mode === 'register'} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 rounded-xl" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-200 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-9 rounded-xl" required />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-dark-600 text-dark-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-dark-300 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Stored securely on this device (SHA-256).</p>
                </div>

                {error && <div className="rounded-xl border border-error/30 bg-error/10 p-2.5 text-sm text-error">{error}</div>}

                <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2 py-2.5 !rounded-xl disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {mode === 'register' ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="text-xs text-center text-dark-300">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} className="text-primary hover:underline font-medium">
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>

            <p className="text-[11px] text-center text-dark-300 mt-4">By continuing you agree to our Terms and Privacy Policy. Keys are stored locally and sent directly to AI providers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
