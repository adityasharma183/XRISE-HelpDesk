import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '../types/auth.types';
import { authApi } from '../api/authApi';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(credentials);
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          const message = err.response?.data?.error?.message || err.message || 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false, user: null, token: null });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {}
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      checkAuth: async () => {
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'xr_auth_session',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
