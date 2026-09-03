import { useQuery } from '@tanstack/react-query';
import { agentApi } from '../api/agentApi';

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
};

export function useAgentsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: () => agentApi.getAgents(),
    enabled,
  });
}
