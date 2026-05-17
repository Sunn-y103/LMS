import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorageAdapter } from '@/lib/storage.adapters';
import { STORAGE_KEYS } from '@/constants/app.constants';
import type { UserProfile } from '@/types/domain.types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  avatarUri: string | null;
  avatarMap: Record<string, string>;
}

interface AuthActions {
  setUser: (user: UserProfile) => void;
  updateAvatar: (uri: string) => void;
  setAuthenticated: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      avatarUri: null,
      avatarMap: {},

      setUser: (user) => set((s) => ({
        user,
        isAuthenticated: true,
        avatarUri: s.avatarMap[user.id] ?? null,
      })),

      updateAvatar: (uri) => set((s) => ({
        user: s.user ? { ...s.user, avatar: uri } : null,
        avatarUri: uri,
        avatarMap: s.user ? { ...s.avatarMap, [s.user.id]: uri } : s.avatarMap,
      })),

      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setHydrated: (value) => set({ isHydrated: value }),
      logout: () => set({ user: null, isAuthenticated: false, avatarUri: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH_SESSION,
      storage: createJSONStorage(() => secureStorageAdapter),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        avatarUri: state.avatarUri,
        avatarMap: state.avatarMap,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (s: AuthState & AuthActions) => s.user;
export const selectIsAuthenticated = (s: AuthState & AuthActions) => s.isAuthenticated;
export const selectIsHydrated = (s: AuthState & AuthActions) => s.isHydrated;
export const selectActiveUserId = (s: AuthState & AuthActions) => s.user?.id ?? null;
