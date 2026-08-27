import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Web fallback that mimics MMKV API using localStorage
function createWebStorage() {
  return {
    getString: (key: string) => {
      try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; } catch { return null; }
    },
    set: (key: string, value: string) => {
      try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch {}
    },
    delete: (key: string) => {
      try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch {}
    },
  };
}

export function createMMKV(id: string) {
  if (Platform.OS === 'web') return createWebStorage() as any;
  try {
    return new MMKV({ id });
  } catch {
    return createWebStorage() as any;
  }
}

export function createMMKVMiddleware(id: string) {
  const storage = createMMKV(id);
  return {
    getItem: (name: string) => {
      try {
        const v = storage.getString(name);
        return v ? JSON.parse(v as string) : null;
      } catch { return null; }
    },
    setItem: (name: string, value: unknown) => {
      try { storage.set(name, JSON.stringify(value)); } catch {}
    },
    removeItem: (name: string) => {
      try { storage.delete(name); } catch {}
    },
  };
}
