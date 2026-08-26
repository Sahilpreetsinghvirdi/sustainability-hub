// mobile/src/store/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { UserPreferences } from '@/types';

const mmkvStorage = new MMKV({ id: 'settings-storage' });

const mmkvMiddleware = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    mmkvStorage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    mmkvStorage.delete(name);
  },
};

interface SettingsState {
  preferences: UserPreferences;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  autoSyncEnabled: boolean;
  syncFrequency: number; // minutes
  dataSaverMode: boolean;
  units: 'metric' | 'imperial';

  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setSyncFrequency: (minutes: number) => void;
  setDataSaverMode: (enabled: boolean) => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  carbon_budget_monthly_kg: 200,
  energy_target_kwh_monthly: 400,
  food_waste_target_kg_monthly: 3.5,
  notifications_enabled: true,
  units: 'metric',
  theme: 'system',
};

const initialState = {
  preferences: defaultPreferences,
  theme: 'system' as const,
  language: 'en',
  notificationsEnabled: true,
  biometricEnabled: false,
  autoSyncEnabled: true,
  syncFrequency: 5,
  dataSaverMode: false,
  units: 'metric' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setAutoSyncEnabled: (autoSyncEnabled) => set({ autoSyncEnabled }),
      setSyncFrequency: (syncFrequency) => set({ syncFrequency }),
      setDataSaverMode: (dataSaverMode) => set({ dataSaverMode }),
      setUnits: (units) => set({ units, preferences: { ...useSettingsStore.getState().preferences, units } }),

      reset: () => set(initialState),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvMiddleware),
    }
  )
);

export const usePreferences = () => useSettingsStore((state) => state.preferences);
export const useTheme = () => useSettingsStore((state) => state.theme);
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useNotificationsEnabled = () => useSettingsStore((state) => state.notificationsEnabled);
export const useBiometricEnabled = () => useSettingsStore((state) => state.biometricEnabled);
export const useAutoSyncEnabled = () => useSettingsStore((state) => state.autoSyncEnabled);
export const useSyncFrequency = () => useSettingsStore((state) => state.syncFrequency);
export const useDataSaverMode = () => useSettingsStore((state) => state.dataSaverMode);
export const useUnits = () => useSettingsStore((state) => state.units);
