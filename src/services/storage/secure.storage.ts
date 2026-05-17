import * as SecureStore from 'expo-secure-store';

const PREFIX = 'lh_';

export async function getSecureItem<T>(key: string): Promise<T | null> {
  try {
    const value = await SecureStore.getItemAsync(PREFIX + key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setSecureItem<T>(key: string, value: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(PREFIX + key, JSON.stringify(value));
  } catch {
    // SecureStore unavailable (web/simulator) — fail silently
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PREFIX + key);
  } catch {
    // fail silently
  }
}
