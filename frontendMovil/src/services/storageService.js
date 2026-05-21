import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStore = new Map();

const hasLocalStorage = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.localStorage);

export const tokenStorage = {
  async getItem(key) {
    if (hasLocalStorage()) {
      return window.localStorage.getItem(key);
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryStore.get(key) || null;
    }
  },

  async setItem(key, value) {
    if (hasLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },

  async deleteItem(key) {
    if (hasLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};
