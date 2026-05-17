import type { ApiError } from '@/types/api.types';
import { isAxiosError } from '@/types/api.types';

export function normalizeError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return { kind: 'timeout', message: 'Request timed out. Please try again.' };
      }
      return { kind: 'network', message: 'Network error. Check your connection.' };
    }
    const status = error.response.status;
    const message =
      (error.response.data as { message?: string })?.message ?? error.message;

    if (status === 401) return { kind: 'unauthorized', message };
    if (status === 403) return { kind: 'forbidden', message };
    if (status === 404) return { kind: 'not_found', message };
    return { kind: 'server', status, message };
  }

  if (error instanceof Error && error.message === 'offline') {
    return { kind: 'offline', message: 'You are offline. Please check your connection.' };
  }

  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    error,
  };
}

export function getErrorMessage(error: ApiError): string {
  return error.message;
}

export function isRetryable(error: ApiError): boolean {
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}
