export type Provider = 'local' | 'google' | 'microsoft';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: Provider;
  avatar?: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  passwordHash?: string;
}

const USERS_KEY = 'sh_auth_users';
const SESSION_KEY = 'sh_auth_session';
const SESSION_DAYS = 7;

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users: StoredUser[]) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

export interface Session {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: Session = JSON.parse(raw);
    if (new Date(s.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!getSession();
}

export function getCurrentUser(): AuthUser | null {
  return getSession()?.user ?? null;
}

function saveSession(user: AuthUser) {
  const session: Session = {
    user,
    token: `sh_${btoa(user.id + ':' + Date.now()).slice(0, 32)}`,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000).toISOString(),
  };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
  // Sync profile for sidebar/settings
  try {
    const existing = JSON.parse(localStorage.getItem('sh_profile') || 'null');
    if (!existing || existing.email === 'sahil@example.com') {
      localStorage.setItem('sh_profile', JSON.stringify({ name: user.name, email: user.email, location: '', diet: 'Omnivore' }));
    }
  } catch {}
  window.dispatchEvent(new CustomEvent('auth-changed'));
  window.dispatchEvent(new CustomEvent('profile-updated'));
  return session;
}

export function logout() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !name.trim() || !password) throw new Error('All fields are required.');
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(cleanEmail)) throw new Error('Invalid email.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const users = loadUsers();
  if (users.find(u => u.email === cleanEmail)) throw new Error('An account with this email already exists.');
  const hash = await sha256(password);
  const user: StoredUser = { id: `u_${Date.now()}`, name: name.trim(), email: cleanEmail, provider: 'local', passwordHash: hash, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  const { passwordHash: _, ...publicUser } = user;
  saveSession(publicUser);
  return publicUser;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const found = users.find(u => u.email === cleanEmail);
  if (!found) throw new Error('No account found for this email.');
  if (found.provider !== 'local') throw new Error(`This email is registered via ${found.provider}. Use ${found.provider} sign-in.`);
  const hash = await sha256(password);
  if (hash !== found.passwordHash) throw new Error('Incorrect password.');
  const { passwordHash: _, ...publicUser } = found;
  saveSession(publicUser);
  return publicUser;
}

function upsertOAuthUser(email: string, name: string, provider: Provider): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  let existing = users.find(u => u.email === cleanEmail);
  if (existing) {
    // Upgrade provider if needed
    existing.name = name || existing.name;
    existing.provider = provider;
    saveUsers(users);
    const { passwordHash: _, ...pub } = existing;
    saveSession(pub);
    return pub;
  }
  const user: StoredUser = { id: `u_${Date.now()}`, name: name || cleanEmail.split('@')[0], email: cleanEmail, provider, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  const { passwordHash: _, ...pub } = user;
  saveSession(pub);
  return pub;
}

export function loginWithOAuthEmail(email: string, name: string, provider: Provider): AuthUser {
  return upsertOAuthUser(email, name, provider);
}

// Google / Microsoft — if VITE_GOOGLE_CLIENT_ID / VITE_MICROSOFT_CLIENT_ID is set we use real OAuth,
// otherwise we return a signal for the UI to show the native chooser window.
export async function loginWithGoogle(): Promise<AuthUser> {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  if (!clientId) throw new Error('OAUTH_NO_CLIENT_ID');
  return new Promise((resolve, reject) => {
    const width = 520, height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const state = Math.random().toString(36).slice(2);
    const redirect = window.location.origin;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=id_token&scope=${encodeURIComponent('openid email profile')}&nonce=${state}&prompt=select_account`;
    const popup = window.open(url, 'google_oauth', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) return reject(new Error('Popup blocked. Allow popups for Google sign-in.'));
    const timer = setInterval(() => {
      try { if (popup.closed) { clearInterval(timer); reject(new Error('Google sign-in cancelled.')); } } catch {}
    }, 500);
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'google_oauth' && e.data?.email) {
        clearInterval(timer);
        window.removeEventListener('message', handler);
        try { popup.close(); } catch {}
        resolve(upsertOAuthUser(e.data.email, e.data.name || '', 'google'));
      }
    };
    window.addEventListener('message', handler);
    setTimeout(() => { clearInterval(timer); window.removeEventListener('message', handler); try { popup.close(); } catch {} reject(new Error('Google sign-in timed out.')); }, 120000);
  });
}

export async function loginWithMicrosoft(): Promise<AuthUser> {
  const clientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID || '';
  if (!clientId) throw new Error('OAUTH_NO_CLIENT_ID');
  const width = 520, height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const tenant = 'common';
  const redirect = window.location.origin;
  const state = Math.random().toString(36).slice(2);
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${encodeURIComponent(clientId)}&response_type=id_token&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent('openid email profile')}&nonce=${state}&prompt=select_account`;
  const popup = window.open(url, 'ms_oauth', `width=${width},height=${height},left=${left},top=${top}`);
  if (!popup) throw new Error('Popup blocked. Allow popups for Microsoft sign-in.');
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => { try { if (popup.closed) { clearInterval(timer); reject(new Error('Microsoft sign-in cancelled.')); } } catch {} }, 500);
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'microsoft_oauth' && e.data?.email) {
        clearInterval(timer);
        window.removeEventListener('message', handler);
        try { popup.close(); } catch {}
        resolve(upsertOAuthUser(e.data.email, e.data.name || '', 'microsoft'));
      }
    };
    window.addEventListener('message', handler);
    setTimeout(() => { clearInterval(timer); window.removeEventListener('message', handler); try { popup.close(); } catch {} reject(new Error('Microsoft sign-in timed out.')); }, 120000);
  });
}
