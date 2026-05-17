import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { loginUser } from '@/services/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { hydrateUserStores } from '@/stores/userStoreManager';
import { normalizeError } from '@/utils/error.utils';
import type { AuthLoginData } from '@/types/api.types';
import type { ApiError } from '@/types/api.types';

interface UseLoginResult {
  login: (data: AuthLoginData) => void;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useLogin(): UseLoginResult {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      const userProfile = {
        id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        avatar: data.user.avatar?.url,
        role: data.user.role,
        createdAt: data.user.createdAt,
      };

      // 1. Set authenticated user in auth store (SecureStore)
      setUser(userProfile);

      // 2. Hydrate all user-scoped stores with this user's persisted data
      //    This reads bookmarks-{userId}, enrollments-{userId}, etc. from AsyncStorage
      await hydrateUserStores(userProfile.id);

      // 3. Navigate to home
      router.replace('/(tabs)/home');
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
    reset: mutation.reset,
  };
}
