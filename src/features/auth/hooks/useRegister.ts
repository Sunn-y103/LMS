import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { registerUser } from '@/services/api/auth.api';
import { normalizeError } from '@/utils/error.utils';
import type { AuthRegisterData } from '@/types/api.types';
import type { ApiError } from '@/types/api.types';

interface UseRegisterResult {
  register: (data: AuthRegisterData) => void;
  isLoading: boolean;
  error: ApiError | null;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Registration hook.
 *
 * After successful registration:
 *  1. Sets isSuccess = true (so the UI can show a success message)
 *  2. Redirects to login screen after a brief delay
 *
 * Does NOT auto-login — the user must manually enter credentials.
 * This ensures the login flow properly hydrates user-scoped stores.
 */
export function useRegister(): UseRegisterResult {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: AuthRegisterData) => {
      await registerUser(data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      // Redirect to login after showing success feedback
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    },
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
    isSuccess,
    reset: () => {
      mutation.reset();
      setIsSuccess(false);
    },
  };
}
