import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVMiddleware } from './mmkvWebFallback';

const storage = createMMKVMiddleware('ai-config');

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
