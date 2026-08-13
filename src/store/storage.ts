import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'beneficiaries-app' });

export const persistentStorage = {
  getJson<T>(key: string): T | undefined {
    const value = storage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      storage.remove(key);
      return undefined;
    }
  },
  setJson<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },
  remove(key: string): void {
    storage.remove(key);
  },
};
