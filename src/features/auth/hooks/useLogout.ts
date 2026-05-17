import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { clearTokens } from '@/services/api/client';
import { resetUserStores } from '@/stores/userStoreManager';

/**
 * Centralized logout hook.
 *
 * Performs a complete, safe logout:
 *  1. Clears auth tokens from SecureStore
 *  2. Resets all user-scoped stores (in-memory only — AsyncStorage data preserved)
 *  3. Resets auth store state
 *  4. Navigates to login screen
 *
 * Does NOT call AsyncStorage.clear() — user data is preserved for re-login.
 */
export function useLogout() {
  const router = useRouter();
  const authLogout = useAuthStore((s) => s.logout);

  const logout = useCallback(async () => {
    // 1. Clear tokens from SecureStore
    await clearTokens();

    // 2. Reset all user-scoped stores (bookmarks, enrollments, preferences, activity)
    //    This clears in-memory state but preserves AsyncStorage data
    resetUserStores();

    // 3. Reset auth store
    authLogout();

    // 4. Navigate to login
    router.replace('/(auth)/login');
  }, [authLogout, router]);

  return { logout };
}
