import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/api/auth.api';
import { clearTokens, getAccessToken } from '@/services/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { hydrateUserStores } from '@/stores/userStoreManager';

interface SessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Bootstraps the user session on app launch.
 *
 * Flow:
 *  1. Wait for auth store to rehydrate from SecureStore
 *  2. Check for stored access token
 *  3. Validate token by fetching current user from API
 *  4. If valid: set user in auth store + hydrate all user-scoped stores
 *  5. If invalid: clear tokens and logout
 *
 * The user-scoped stores (bookmarks, enrollments, etc.) are hydrated
 * AFTER we know the userId, ensuring correct data isolation.
 */
export function useSession(): SessionState {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, logout, isHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    async function bootstrapSession(): Promise<void> {
      try {
        const token = await getAccessToken();
        if (!token) {
          logout();
          return;
        }
        const user = await getCurrentUser();
        if (!cancelled) {
          const userProfile = {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar?.url,
            role: user.role,
            createdAt: user.createdAt,
          };

          // Set user in auth store (SecureStore)
          setUser(userProfile);

          // Hydrate all user-scoped stores with this user's persisted data
          await hydrateUserStores(userProfile.id);
        }
      } catch {
        // Token invalid or expired beyond refresh — clear and logout
        await clearTokens();
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrapSession();
    return () => { cancelled = true; };
  }, [isHydrated, setUser, logout]);

  return { isLoading: isLoading || !isHydrated, isAuthenticated };
}
