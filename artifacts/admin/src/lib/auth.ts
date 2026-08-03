import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  role: 'PLATFORM_ADMIN' | 'SPA_OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'THERAPIST' | 'CUSTOMER';
  spaId?: string;
  spaSetupComplete?: boolean;
  ownedSpas?: any[];
  spaApprovalStatus?: string;
  isDemo?: boolean;
  phone?: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  refreshAccessToken: () => Promise<string | null>;
  logout: (refreshToken?: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: localStorage.getItem('admin_token'),
  refreshToken: localStorage.getItem('admin_refresh_token'),
  user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  
  setAuth: (token, refreshToken, user) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ token, refreshToken, user });
  },

  refreshAccessToken: async () => {
    const storedRefresh = get().refreshToken;
    if (!storedRefresh) return null;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      localStorage.setItem('admin_token', data.accessToken);
      set({ token: data.accessToken });
      return data.accessToken;
    } catch {
      // Refresh failed — clear session
      get().logout();
      return null;
    }
  },

  logout: async (refreshToken?: string) => {
    const token = refreshToken || get().refreshToken;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      }).catch(() => {});
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    set({ token: null, refreshToken: null, user: null });
  },
}));
