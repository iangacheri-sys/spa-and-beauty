// Central API client for Mobile app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Priority order for API base URL:
// 1. EXPO_PUBLIC_API_URL env var (set for production EAS builds or via .env)
// 2. Expo Go LAN host (auto-detected in dev via Expo debugger)
// 3. Android emulator localhost alias
// 4. Generic localhost fallback (iOS simulator / web)
const expoPublicApiUrl = process.env.EXPO_PUBLIC_API_URL;
const debuggerHost = Constants.expoConfig?.hostUri;

export const API_BASE = expoPublicApiUrl
  ? `${expoPublicApiUrl.replace(/\/$/, '')}/api`
  : debuggerHost
    ? `http://${debuggerHost.split(':')[0]}:5000/api`
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
}
