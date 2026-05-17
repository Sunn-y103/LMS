import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'lh_';

export async function getAsyncItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(PREFIX + key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setAsyncItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // fail silently
  }
}

export async function removeAsyncItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // fail silently
  }
}

/**
 * Clear only app-prefixed non-user-scoped cache data.
 * Does NOT clear user-scoped data (bookmarks, enrollments, etc.)
 * For clearing user data, use `clearCurrentUserData()` from userScopedStorage.
 */
export async function clearAppCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    // Only remove keys with our app prefix — never touch user-scoped store keys
    const cacheKeys = allKeys.filter((k) => k.startsWith(PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // fail silently
  }
}
