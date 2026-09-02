import { apiClient } from '../../../lib/apiClient';
import { User, LoginCredentials } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data.user;
  },
};
