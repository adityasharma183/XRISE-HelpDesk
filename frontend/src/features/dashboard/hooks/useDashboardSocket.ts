import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../lib/socket';
import { ticketKeys } from '../../tickets/hooks/useTickets';

export function useDashboardSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    // 1. Join dashboard staff room
    socket.emit('dashboard:join', (res?: { success: boolean; error?: string }) => {
      if (res && !res.success) {
        console.warn('[Socket.IO] Could not join dashboard room:', res.error);
      }
    });

    // 2. Event Handlers
    const handleTicketCreated = () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    };

    const handleTicketStatusChanged = () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    };

    const handleTicketAssigned = () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    };

    const handleTicketReplyAdded = () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:status-changed', handleTicketStatusChanged);
    socket.on('ticket:assigned', handleTicketAssigned);
    socket.on('ticket:reply-added', handleTicketReplyAdded);

    return () => {
      socket.emit('dashboard:leave');
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:status-changed', handleTicketStatusChanged);
      socket.off('ticket:assigned', handleTicketAssigned);
      socket.off('ticket:reply-added', handleTicketReplyAdded);
    };
  }, [queryClient]);
}
