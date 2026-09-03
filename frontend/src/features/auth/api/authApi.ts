import { apiClient } from '../../../lib/apiClient';
import { User } from '../types/auth.types';
import { LoginFormData } from '../schemas/auth.schemas';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<{ user: User; token: string }> => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },
};
