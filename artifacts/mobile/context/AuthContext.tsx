import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../lib/api';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  spaId?: string;
  isDemo?: boolean;
  accountStatus?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /**
   * Initiates login. If the user requires OTP, returns { requiresOtp: true }.
   * Otherwise returns user session.
   */
  login: (phone: string, password: string) => Promise<{ requiresOtp?: boolean; message?: string }>;
  /**
   * Verifies OTP code and completes login.
   */
  verifyOtp: (phone: string, code: string) => Promise<void>;
  /**
   * Silently refreshes the access token using the stored refresh token.
   * Returns the new access token, or null if the session is no longer valid.
   */
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const [storedToken, userJson] = await AsyncStorage.multiGet(['token', 'user']);
      if (storedToken[1]) setToken(storedToken[1]);
      if (userJson[1]) setUser(JSON.parse(userJson[1]));
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSession = async (accessToken: string, refreshToken: string, userData: User) => {
    await AsyncStorage.multiSet([
      ['token', accessToken],
      ['refresh_token', refreshToken],
      ['user', JSON.stringify(userData)],
    ]);
    setToken(accessToken);
    setUser(userData);
  };

  const login = async (phone: string, password: string): Promise<{ requiresOtp?: boolean; message?: string }> => {
    const res = await apiFetch<{ accessToken?: string; refreshToken?: string; user?: User; requiresOtp?: boolean; message?: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ phone, password }) }
    );

    if (res.requiresOtp) {
      return { requiresOtp: true, message: res.message };
    }

    if (res.accessToken && res.refreshToken && res.user) {
      await persistSession(res.accessToken, res.refreshToken, res.user);
    }

    return {};
  };

  const verifyOtp = async (phone: string, code: string): Promise<void> => {
    const res = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
      '/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, code }) }
    );
    await persistSession(res.accessToken, res.refreshToken, res.user);
  };

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefresh = await AsyncStorage.getItem('refresh_token');
      if (!storedRefresh) return null;

      const res = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken: storedRefresh }) }
      );

      await AsyncStorage.setItem('token', res.accessToken);
      setToken(res.accessToken);
      return res.accessToken;
    } catch {
      await logout();
      return null;
    }
  }, []);

  const logout = async () => {
    try {
      const storedRefresh = await AsyncStorage.getItem('refresh_token');
      if (storedRefresh) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: storedRefresh }),
        }).catch(() => {});
      }
    } finally {
      await AsyncStorage.multiRemove(['token', 'refresh_token', 'user']);
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, verifyOtp, refreshAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
