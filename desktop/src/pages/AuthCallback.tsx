import { useEffect } from 'react';

function parseJwt(token: string): any {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

export default function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash || window.location.search;
    const params = new URLSearchParams(hash.replace(/^#/, '').replace(/^\?/, ''));
    // Google returns id_token, Microsoft returns id_token or access_token
    const idToken = params.get('id_token') || params.get('access_token') || '';
    const error = params.get('error');
    if (error) {
      try { window.opener?.postMessage({ type: 'oauth_error', error }, window.location.origin); } catch {}
      window.close();
      return;
    }
    if (idToken) {
      const payload = parseJwt(idToken);
      const email: string = payload?.email || payload?.preferred_username || '';
      const name: string = payload?.name || payload?.given_name || email.split('@')[0];
      const provider = window.location.search.includes('google') || hash.includes('google') ? 'google' : (window.opener as any)?.__oauth_provider || 'google';
      // Fallback: detect by issuer
      const prov: 'google' | 'microsoft' = payload?.iss?.includes('microsoft') || payload?.iss?.includes('live') ? 'microsoft' : 'google';
      try {
        window.opener?.postMessage({ type: prov === 'google' ? 'google_oauth' : 'microsoft_oauth', email, name }, window.location.origin);
      } catch {}
      // Also for generic chooser listener
      try { window.opener?.postMessage({ type: 'oauth_chooser', provider: prov, email, name }, '*'); } catch {}
      setTimeout(() => window.close(), 300);
      return;
    }
    // No token — close
    setTimeout(() => window.close(), 1000);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#0d1117', color: '#e6edf3' }}>
      <p>Completing sign-in… You can close this window.</p>
    </div>
  );
}
