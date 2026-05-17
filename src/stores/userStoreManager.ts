/**
 * User Store Manager
 *
 * Central orchestrator for all user-scoped Zustand stores.
 * Handles hydration (binding stores to a user's data) and reset (logout cleanup).
 *
 * Flow:
 *   Login  → hydrateUserStores(userId) → reads bookmarks-{userId}, enrollments-{userId}, etc.
 *   Logout → resetUserStores()         → resets in-memory state, preserves AsyncStorage data
 */
import { setActiveUserId } from '@/lib/userScopedStorage';
import { useBookmarkStore } from './bookmark.store';
import { useEnrollmentStore } from './enrollment.store';
import { usePreferencesStore } from './preferences.store';
import { useOfflineStore } from './offline.store';
import { useProgressStore } from './progress.store';
import { queryClient } from '@/lib/queryClient';

/**
 * Hydrate all user-scoped stores for the given userId.
 * Sets the active userId in the storage adapter, then triggers Zustand
 * persist rehydration so each store reads from its user-scoped key.
 */
export async function hydrateUserStores(userId: string): Promise<void> {
  // 1. Tell the storage adapter which user is active
  setActiveUserId(userId);

  // 2. Trigger rehydration of all user-scoped stores
  await Promise.all([
    useBookmarkStore.persist.rehydrate(),
    useEnrollmentStore.persist.rehydrate(),
    usePreferencesStore.persist.rehydrate(),
    useOfflineStore.persist.rehydrate(),
    useProgressStore.persist.rehydrate(),
  ]);
}

/**
 * Reset all user-scoped stores to their default state.
 * Does NOT delete persisted data from AsyncStorage.
 *
 * CRITICAL: Detach userId BEFORE resetting to prevent persist middleware
 * from writing empty defaults back to AsyncStorage.
 */
export function resetUserStores(): void {
  // 1. Detach storage adapter FIRST (prevents overwriting saved data)
  setActiveUserId(null);

  // 2. Reset in-memory state (writes go nowhere since userId is null)
  useBookmarkStore.getState().reset();
  useEnrollmentStore.getState().reset();
  usePreferencesStore.getState().reset();
  useOfflineStore.getState().reset();
  useProgressStore.getState().reset();

  // 3. Clear React Query cache
  queryClient.clear();
}
