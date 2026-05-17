import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { STORAGE_KEYS } from '@/constants/app.constants';
import type { OfflineAction } from '@/types/domain.types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface OfflineState {
  queue: OfflineAction[];
}

interface OfflineActions {
  addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  getQueue: () => OfflineAction[];
  reset: () => void;
}

const initialState: OfflineState = {
  queue: [],
};

export const useOfflineStore = create<OfflineState & OfflineActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addToQueue: (action) => {
        const entry: OfflineAction = {
          ...action,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((s) => ({ queue: [...s.queue, entry] }));
      },

      removeFromQueue: (id) =>
        set((s) => ({ queue: s.queue.filter((a) => a.id !== id) })),

      clearQueue: () => set({ queue: [] }),
      getQueue: () => get().queue,
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.ACTIVITY,
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectOfflineQueue = (s: OfflineState) => s.queue;
export const selectOfflineQueueLength = (s: OfflineState) => s.queue.length;
