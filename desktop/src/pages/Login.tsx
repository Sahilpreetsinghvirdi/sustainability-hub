import { useState } from 'react';
import { Loader2, Leaf, Mail, Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { login, register, loginWithGoogle, loginWithMicrosoft, loginWithOAuthEmail } from '@/lib/auth';
import softwareLogo from '@/assets/logo.png';

function openChooserWindow(provider: 'google' | 'microsoft'): Promise<{ email: string; name: string }> {
  return new Promise((resolve, reject) => {
    const isGoogle = provider === 'google';
    const title = isGoogle ? 'Google' : 'Microsoft';
    const logo = isGoogle
      ? `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 23 23"><path fill="#f1511b" d="M1 1h10v10H1z"/><path fill="#80cc28" d="M12 1h10v10H12z"/><path fill="#00adef" d="M1 12h10v10H1z"/><path fill="#fbbc09" d="M12 12h10v10H12z"/></svg>`;
    const accent = isGoogle ? '#1a73e8' : '#0078d4';
    let saved: any[] = [];
    try { saved = JSON.parse(localStorage.getItem('sh_auth_users') || '[]').filter((u: any) => u.provider === provider).slice(0, 3); } catch {}
    const accountsHtml = saved.map((u: any) => `
      <button class="account" data-email="${u.email}" data-name="${(u.name || '').replace(/"/g, '&quot;')}">
        <div class="avatar">${(u.name || u.email).trim().split(/\s+/).slice(0,2).map((w:string)=>w[0]?.toUpperCase()).join('').slice(0,2) || 'U'}</div>
        <div class="info"><div class="name">${u.name || u.email.split('@')[0]}</div><div class="email">${u.email}</div></div>
      </button>
    `).join('');
    // Standard Google/Microsoft chooser — exact replica of screenshot (dark, two-column)
    const pageBg = '#0d1117';
    const cardBg = '#161b22';
    const border = '#30363d';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Choose an account — ${title}</title>
    <style>
      *{box-sizing:border-box} body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:${pageBg};color:#e6edf3}
      .page{max-width:880px;margin:40px auto;padding:0 20px}
      .card{background:${cardBg};border:1px solid ${border};border-radius:16px;overflow:hidden}
      .card-head{display:flex;align-items:center;gap:10;padding:14px 20px;border-bottom:1px solid ${border};background:#0d1117}
      .card-head span{font-size:14px;color:#e6edf3}
      .body{display:flex;gap:32px;padding:28px 28px 22px}
      .left{flex:0 0 38%}
      .left h1{font-size:28px;font-weight:300;margin:18px 0 8px;letter-spacing:-0.3px}
      .left .sub{font-size:14px;color:#8b949e}
      .left .sub a{color:#58a6ff;text-decoration:none}
      .right{flex:1}
      .account{width:100%;display:flex;align-items:center;gap:12;padding:12px 8px;border:none;border-top:1px solid ${border};background:transparent;cursor:pointer;text-align:left}
      .account:first-of-type{border-top:none}
      .account:hover{background:#21262d}
      .avatar{width:32px;height:32px;border-radius:50%;background:#30363d;color:#e6edf3;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;overflow:hidden}
      .avatar img{width:100%;height:100%;object-fit:cover}
      .info{flex:1;min-width:0}
      .name{font-size:14px;font-weight:600;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .email{font-size:12px;color:#8b949e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .signed{font-size:12px;color:#8b949e;flex-shrink:0}
      .use-another{width:100%;display:flex;align-items:center;gap:12;padding:12px 8px;border:none;border-top:1px solid ${border};border-bottom:1px solid ${border};background:transparent;cursor:pointer;text-align:left;color:#e6edf3}
      .use-another:hover{background:#21262d}
      .use-icon{width:32px;height:32px;border-radius:50%;border:1px solid ${border};display:flex;align-items:center;justify-content:center;font-size:14px}
      .field{margin-top:14px;display:flex;gap:8}
      .field input{flex:1;padding:10px 12px;border:1px solid ${border};border-radius:6px;background:#0d1117;color:#e6edf3;font-size:14px}
      .field input::placeholder{color:#8b949e}
      .field input:focus{outline:none;border-color:${accent};box-shadow:0 0 0 3px ${accent}22}
      .btn{padding:9px 16px;border:none;border-radius:6px;background:${accent};color:#fff;font-weight:600;cursor:pointer;white-space:nowrap}
      .foot{font-size:12px;color:#8b949e;margin-top:18px;line-height:1.5}
      .foot a{color:#58a6ff;text-decoration:none}
      .lang-bar{margin-top:14px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#8b949e;padding:0 4px}
      .lang-bar a{color:#8b949e;text-decoration:none;margin-left:16px}
    </style></head><body>
    <div class="page">
      <div class="card">
        <div class="card-head">${logo}<span>Sign in with ${title}</span></div>
        <div class="body">
          <div class="left">
            <div style="width:48px;height:48px;border-radius:50%;background:#21262d;display:flex;align-items:center;justify-content:center;border:1px solid ${border}">🐙</div>
            <h1>Choose an account</h1>
            <div class="sub">to continue to <a href="#" onclick="return false">Sustainability Hub</a></div>
          </div>
          <div class="right">
            ${accountsHtml ? accountsHtml.replace(/class="account"/g,'class="account"').replace(/<div class="avatar">/g,'<div class="avatar">') : '<div style="font-size:13px;color:#8b949e;padding:12px 8px">No saved accounts</div>'}
            <button class="use-another" id="useAnother"><span class="use-icon">👤</span><span style="font-size:14px;font-weight:500">Use another account</span></button>
            <div id="fieldWrap" style="display:none" class="field">
              <input id="email" type="email" placeholder="you@${isGoogle ? 'gmail.com' : 'outlook.com'}" />
              <button id="go" class="btn">Continue</button>
            </div>
            <div class="foot">Before using this app, you can review Sustainability Hub&apos;s <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.</div>
          </div>
        </div>
      </div>
      <div class="lang-bar"><span>English (United States) ▾</span><span><a href="#">Help</a><a href="#">Privacy</a><a href="#">Terms</a></span></div>
    </div>
    <script>
      const post = (email,name) => { try{ window.opener.postMessage({type:'oauth_chooser', provider:'${provider}', email, name}, '*'); }catch{} window.close(); };
      document.querySelectorAll('.account').forEach(b=> b.addEventListener('click',()=> post(b.dataset.email, b.dataset.name)));
      const useBtn=document.getElementById('useAnother'), fieldWrap=document.getElementById('fieldWrap');
      if(useBtn) useBtn.addEventListener('click',()=>{ fieldWrap.style.display='flex'; document.getElementById('email').focus(); });
      const emailEl=document.getElementById('email'), go=document.getElementById('go');
      go.addEventListener('click',()=>{
        const v=emailEl.value.trim(); if(!v || !/^[^@]+@[^@]+\\.[^@]+$/.test(v)){ emailEl.focus(); emailEl.style.borderColor='#d93025'; return; }
        const name=v.split('@')[0].replace(/[._]/g,' ').replace(/\\b\\w/g,c=>c.toUpperCase());
        post(v,name);
      });
      emailEl.addEventListener('keydown',e=>{ if(e.key==='Enter') go.click(); });
    </script>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = 920, h = 620;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(url, `${provider}_chooser`, `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
    if (!popup) { URL.revokeObjectURL(url); reject(new Error('Popup blocked. Allow popups.')); return; }
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'oauth_chooser' && e.data?.provider === provider && e.data?.email) {
        window.removeEventListener('message', handler);
        URL.revokeObjectURL(url);
        resolve({ email: e.data.email, name: e.data.name || '' });
      }
    };
    window.addEventListener('message', handler);
    const timer = setInterval(() => { try { if (popup.closed) { clearInterval(timer); window.removeEventListener('message', handler); URL.revokeObjectURL(url); reject(new Error('Sign-in cancelled.')); } } catch {} }, 500);
    setTimeout(() => { clearInterval(timer); window.removeEventListener('message', handler); try{ popup.close(); }catch{} URL.revokeObjectURL(url); reject(new Error('Sign-in timed out.')); }, 120000);
  });
}

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
      try {
        await loginWithGoogle();
      } catch (e: any) {
        if (e?.message === 'OAUTH_NO_CLIENT_ID') {
          const { email, name } = await openChooserWindow('google');
          loginWithOAuthEmail(email, name, 'google');
        } else throw e;
      }
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
      try {
        await loginWithMicrosoft();
      } catch (e: any) {
        if (e?.message === 'OAUTH_NO_CLIENT_ID') {
          const { email, name } = await openChooserWindow('microsoft');
          loginWithOAuthEmail(email, name, 'microsoft');
        } else throw e;
      }
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
            <button onClick={handleGoogle} disabled={!!oauthLoading} className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#111827', background: '#ffffff' }}>
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              <span style={{ color: '#111827' }}>Continue with Google</span>
            </button>
            <button onClick={handleMicrosoft} disabled={!!oauthLoading} className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#111827', background: '#ffffff' }}>
              {oauthLoading === 'microsoft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f1511b" d="M1 1h10v10H1z"/><path fill="#80cc28" d="M12 1h10v10H12z"/><path fill="#00adef" d="M1 12h10v10H1z"/><path fill="#fbbc09" d="M12 12h10v10H12z"/></svg>}
              <span style={{ color: '#111827' }}>Continue with Microsoft</span>
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
