import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types/auth.types';
import { authApi } from '../api/authApi';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(credentials);
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          const message = err.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // ignore logout errors
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
