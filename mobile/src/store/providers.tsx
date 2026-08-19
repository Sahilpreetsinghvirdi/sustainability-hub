// mobile/src/store/providers.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { AuthProvider } from './authStore';
import { CarbonStoreProvider } from './carbonStore';
import { EnergyStoreProvider } from './energyStore';
import { FoodWasteStoreProvider } from './foodWasteStore';
import { DashboardStoreProvider } from './dashboardStore';
import { SyncProvider } from './syncStore';
import { SettingsProvider } from './settingsStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const mmkvStorage = new MMKV({ id: 'react-query-cache' });
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => mmkvStorage.getString(key) ?? null,
    setItem: (key, value) => mmkvStorage.set(key, value),
    removeItem: (key) => mmkvStorage.delete(key),
  },
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persister={persister}
        persistOptions={{ maxAge: 1000 * 60 * 60 * 24 }}
      >
        <AuthProvider>
          <SettingsProvider>
            <SyncProvider>
              <CarbonStoreProvider>
                <EnergyStoreProvider>
                  <FoodWasteStoreProvider>
                    <DashboardStoreProvider>
                      {children}
                    </DashboardStoreProvider>
                  </FoodWasteStoreProvider>
                </EnergyStoreProvider>
              </CarbonStoreProvider>
            </SyncProvider>
          </SettingsProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </QueryClientProvider>
  );
}