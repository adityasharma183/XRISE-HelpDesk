import { apiClient } from '../../../lib/apiClient';
import { User } from '../../auth/types/auth.types';

export const agentApi = {
  getAgents: async (): Promise<User[]> => {
    const res = await apiClient.get('/agents');
    return res.data.data;
  },
};
