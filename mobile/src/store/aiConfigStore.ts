import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'ai-config' });
const storage = {
  getItem: (k: string) => { const v = mmkv.getString(k); return v ? JSON.parse(v) : null; },
  setItem: (k: string, v: unknown) => mmkv.set(k, JSON.stringify(v)),
  removeItem: (k: string) => mmkv.delete(k),
};

type Provider = 'gemini' | 'openai';

interface AiConfigState {
  provider: Provider;
  geminiKey: string;
  openaiKey: string;
  geminiModel: string;
  openaiModel: string;
  setProvider: (p: Provider) => void;
  setGeminiKey: (k: string) => void;
  setOpenaiKey: (k: string) => void;
  setGeminiModel: (m: string) => void;
  setOpenaiModel: (m: string) => void;
  isConfigured: () => boolean;
}

export const useAiConfigStore = create<AiConfigState>()(
  persist(
    (set, get) => ({
      provider: 'gemini',
      geminiKey: '',
      openaiKey: '',
      geminiModel: 'gemini-2.0-flash',
      openaiModel: 'gpt-4o-mini',
      setProvider: (provider) => set({ provider }),
      setGeminiKey: (geminiKey) => set({ geminiKey }),
      setOpenaiKey: (openaiKey) => set({ openaiKey }),
      setGeminiModel: (geminiModel) => set({ geminiModel }),
      setOpenaiModel: (openaiModel) => set({ openaiModel }),
      isConfigured: () => {
        const s = get();
        return s.provider === 'gemini' ? !!s.geminiKey : !!s.openaiKey;
      },
    }),
    { name: 'ai-config', storage: createJSONStorage(() => storage) }
  )
);
