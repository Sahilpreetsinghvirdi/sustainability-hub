// mobile/src/store/syncStore.ts
import { create } from 'zustand';
import { SyncStatus } from '@/types';
import { syncService } from '@/services/api';

interface SyncState {
  status: SyncStatus | null;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
  error: string | null;

  setStatus: (status: SyncStatus) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (timestamp: string) => void;
  setPendingCount: (count: number) => void;
  setError: (error: string | null) => void;

  fetchStatus: () => Promise<void>;
  pushChanges: (changes: any[]) => Promise<void>;
  pullChanges: (since: Date) => Promise<void>;
  resolveConflicts: (conflicts: any[]) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  status: null,
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  error: null,
};

export const useSyncStore = create<SyncState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setError: (error) => set({ error }),

  fetchStatus: async () => {
    try {
      const status = await syncService.getStatus();
      set({ status, pendingCount: status.pending_changes || 0, lastSyncAt: status.last_sync_at });
    } catch (error) {
      // Silently fail
    }
  },

  pushChanges: async (changes) => {
    set({ isSyncing: true, error: null });
    try {
      await syncService.pushChanges(changes);
      set({ isSyncing: false });
    } catch (error) {
      set({ isSyncing: false, error: 'Sync failed' });
      throw error;
    }
  },

  pullChanges: async (since) => {
    set({ isSyncing: true, error: null });
    try {
      await syncService.pullChanges(since);
      set({ isSyncing: false });
    } catch (error) {
      set({ isSyncing: false, error: 'Sync failed' });
      throw error;
    }
  },

  resolveConflicts: async (conflicts) => {
    set({ isSyncing: true, error: null });
    try {
      await syncService.resolveConflicts(conflicts);
      set({ isSyncing: false });
    } catch (error) {
      set({ isSyncing: false, error: 'Conflict resolution failed' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

export const useSyncStatus = () => useSyncStore((state) => state.status);
export const useIsSyncing = () => useSyncStore((state) => state.isSyncing);
export const useLastSyncAt = () => useSyncStore((state) => state.lastSyncAt);
export const usePendingSyncCount = () => useSyncStore((state) => state.pendingCount);
export const useSyncError = () => useSyncStore((state) => state.error);