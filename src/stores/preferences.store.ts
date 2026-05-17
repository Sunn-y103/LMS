import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { STORAGE_KEYS } from '@/constants/app.constants';

type ColorScheme = 'light' | 'dark' | 'system';

interface PreferencesState {
  colorScheme: ColorScheme;
  notificationsEnabled: boolean;
  lastOpenedAt: string;
}

interface PreferencesActions {
  setColorScheme: (scheme: ColorScheme) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateLastOpenedAt: () => void;
  reset: () => void;
}

const initialState: PreferencesState = {
  colorScheme: 'dark',
  notificationsEnabled: true,
  lastOpenedAt: new Date().toISOString(),
};

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      ...initialState,

      setColorScheme: (colorScheme) => set({ colorScheme }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      updateLastOpenedAt: () => set({ lastOpenedAt: new Date().toISOString() }),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.PREFERENCES,
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectColorScheme = (s: PreferencesState) => s.colorScheme;
export const selectNotificationsEnabled = (s: PreferencesState) => s.notificationsEnabled;
export const selectLastOpenedAt = (s: PreferencesState) => s.lastOpenedAt;
