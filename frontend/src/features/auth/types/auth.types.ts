export interface User {
  id: string;
  name: string;
  email: string;
  role: 'AGENT' | 'ADMIN';
  isActive?: boolean;
  createdAt?: string;
}

import { LoginFormData } from '../schemas/auth.schemas';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
}
