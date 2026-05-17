/**
 * User-Scoped Storage Adapter
 *
 * Wraps AsyncStorage to automatically namespace all keys with the active user's ID.
 * This ensures complete data isolation between users on the same device.
 *
 * Zustand persist passes the store `name` to getItem/setItem/removeItem.
 * We append `-${userId}` to create isolated namespaces per user.
 * Example: name="bookmarks" + userId="abc123" → key="bookmarks-abc123"
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

// ─── Active User Tracking ────────────────────────────────────────────────────
let activeUserId: string | null = null;

export function setActiveUserId(userId: string | null): void {
  activeUserId = userId;
}

export function getActiveUserId(): string | null {
  return activeUserId;
}

// ─── User-Scoped StateStorage Adapter ────────────────────────────────────────
export const userScopedStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!activeUserId) return null;
    try {
      return await AsyncStorage.getItem(`${name}-${activeUserId}`);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!activeUserId) return;
    try {
      await AsyncStorage.setItem(`${name}-${activeUserId}`, value);
    } catch {
      // Fail silently — offline resilience
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (!activeUserId) return;
    try {
      await AsyncStorage.removeItem(`${name}-${activeUserId}`);
    } catch {
      // Fail silently
    }
  },
};

// ─── User Data Management ────────────────────────────────────────────────────
/** Base key names used by user-scoped stores */
const USER_SCOPED_BASE_KEYS = ['bookmarks', 'enrollments', 'preferences', 'activity', 'progress'];

/**
 * Remove all persisted data for a specific user.
 * Used when a user explicitly requests data deletion.
 */
export async function clearUserData(userId: string): Promise<void> {
  try {
    const keys = USER_SCOPED_BASE_KEYS.map((base) => `${base}-${userId}`);
    await AsyncStorage.multiRemove(keys);
  } catch {
    // Fail silently
  }
}

/**
 * Remove all persisted data for the currently active user.
 * Used for "Clear My Data" in settings.
 */
export async function clearCurrentUserData(): Promise<void> {
  if (!activeUserId) return;
  await clearUserData(activeUserId);
}
