import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../lib/socket';
import { ticketKeys } from './useTickets';

export interface UseTicketSocketOptions {
  ticketId?: string;
  email?: string;
  onStatusChanged?: (data: any) => void;
  onReplyAdded?: (data: any) => void;
  onAssigned?: (data: any) => void;
  onPriorityChanged?: (data: any) => void;
}

export function useTicketSocket(options: UseTicketSocketOptions) {
  const { ticketId, email, onStatusChanged, onReplyAdded, onAssigned, onPriorityChanged } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ticketId) return;

    const socket = getSocket();

    // 1. Join ticket room
    socket.emit('ticket:join', { ticketId, email }, (response?: { success: boolean; error?: string }) => {
      if (response && !response.success) {
        console.warn(`[Socket.IO] Could not join ticket room ticket:${ticketId}:`, response.error);
      }
    });

    // 2. Handle Status Changes
    const handleStatusChanged = (payload: any) => {
      if (payload?.ticketId === ticketId) {
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
        onStatusChanged?.(payload.data);
      }
    };

    // 3. Handle Replies & File Attachments
    const handleReplyAdded = (payload: any) => {
      if (payload?.ticketId === ticketId) {
        queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
        onReplyAdded?.(payload.data);
      }
    };

    // 4. Handle Reassignments
    const handleAssigned = (payload: any) => {
      if (payload?.ticketId === ticketId) {
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
        onAssigned?.(payload.data);
      }
    };

    // 5. Handle Priority Changes
    const handlePriorityChanged = (payload: any) => {
      if (payload?.ticketId === ticketId) {
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
        onPriorityChanged?.(payload.data);
      }
    };

    socket.on('ticket:status-changed', handleStatusChanged);
    socket.on('ticket:reply-added', handleReplyAdded);
    socket.on('ticket:assigned', handleAssigned);
    socket.on('ticket:priority-changed', handlePriorityChanged);

    // Cleanup on unmount or ticketId change
    return () => {
      socket.emit('ticket:leave', { ticketId });
      socket.off('ticket:status-changed', handleStatusChanged);
      socket.off('ticket:reply-added', handleReplyAdded);
      socket.off('ticket:assigned', handleAssigned);
      socket.off('ticket:priority-changed', handlePriorityChanged);
    };
  }, [ticketId, email, queryClient, onStatusChanged, onReplyAdded, onAssigned, onPriorityChanged]);
}
