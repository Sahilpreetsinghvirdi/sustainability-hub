import { useState } from 'react';
import { Loader2, Leaf, Mail, Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { login, register, loginWithGoogle, loginWithMicrosoft } from '@/lib/auth';
import softwareLogo from '@/assets/logo.png';

export default function LoginPage({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | 'google' | 'microsoft'>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading('google');
    try {
      await loginWithGoogle();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleMicrosoft = async () => {
    setError(null);
    setOauthLoading('microsoft');
    try {
      await loginWithMicrosoft();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft sign-in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 mb-3">
            <img src={softwareLogo} alt="logo" className="w-9 h-9 rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-dark-50">Sustainability Hub</h1>
          <p className="text-sm text-dark-200 mt-1 flex items-center justify-center gap-1.5">
            <Leaf className="w-4 h-4 text-primary" /> Sign in to continue
          </p>
        </div>

        <div className="card-elevated p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-700 border border-dark-500">
            <button onClick={() => setMode('login')} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-dark-50 text-dark-800' : 'text-dark-200 hover:text-dark-50'}`}>Sign in</button>
            <button onClick={() => setMode('register')} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-dark-50 text-dark-800' : 'text-dark-200 hover:text-dark-50'}`}>Create account</button>
          </div>

          <div className="space-y-2.5">
            <button onClick={handleGoogle} disabled={!!oauthLoading} className="w-full btn-outline inline-flex items-center justify-center gap-2 !bg-white !text-dark-800 hover:!bg-dark-50 !border-dark-200 disabled:opacity-60">
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              Continue with Google
            </button>
            <button onClick={handleMicrosoft} disabled={!!oauthLoading} className="w-full btn-outline inline-flex items-center justify-center gap-2 !bg-white !text-dark-800 hover:!bg-dark-50 !border-dark-200 disabled:opacity-60">
              {oauthLoading === 'microsoft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f1511b" d="M1 1h10v10H1z"/><path fill="#80cc28" d="M12 1h10v10H12z"/><path fill="#00adef" d="M1 12h10v10H1z"/><path fill="#fbbc09" d="M12 12h10v10H12z"/></svg>}
              Continue with Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-dark-500" />
            <span className="text-xs text-dark-300">or</span>
            <div className="h-px flex-1 bg-dark-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-dark-200 mb-1 block">Full name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full pl-9" required={mode === 'register'} />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-dark-200 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-dark-200 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-9" required />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-dark-600 text-dark-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-dark-300 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Stored securely on this device (SHA-256).</p>
            </div>

            {error && <div className="rounded-lg border border-error/30 bg-error/10 p-2.5 text-sm text-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
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
  );
}
