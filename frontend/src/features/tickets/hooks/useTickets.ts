import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ticketApi } from '../api/ticketApi';
import {
  TicketQueryParams,
  TicketStatus,
  TicketPriority,
} from '../types/ticket.types';
import { SubmitTicketFormData } from '../schemas/ticket.schemas';

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params?: TicketQueryParams) => [...ticketKeys.lists(), params] as const,
  dashboard: () => [...ticketKeys.all, 'dashboard'] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  timelines: () => [...ticketKeys.all, 'timeline'] as const,
  timeline: (id: string) => [...ticketKeys.timelines(), id] as const,
};

export function useTicketsQuery(params?: TicketQueryParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketApi.getTickets(params),
  });
}

export function useDashboardTicketsQuery(limit: number = 12) {
  return useQuery({
    queryKey: ticketKeys.dashboard(),
    queryFn: () => ticketApi.getTickets({ limit }),
  });
}

export function useTicketDetailQuery(ticketId?: string) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId || ''),
    queryFn: () => ticketApi.getTicketById(ticketId!),
    enabled: !!ticketId,
  });
}

export function useTicketTimelineQuery(ticketId?: string) {
  return useQuery({
    queryKey: ticketKeys.timeline(ticketId || ''),
    queryFn: () => ticketApi.getTicketTimeline(ticketId!),
    enabled: !!ticketId,
  });
}

export function useCreateInternalTicketMutation(options?: {
  onSuccess?: (ticket: any) => void;
  onError?: (err: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: (SubmitTicketFormData & { assigneeId?: string | null }) | { data: SubmitTicketFormData & { assigneeId?: string | null }; files?: File[] }) => {
      if ('data' in payload) {
        return ticketApi.createInternalTicket(payload.data, payload.files);
      }
      return ticketApi.createInternalTicket(payload);
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      options?.onSuccess?.(newTicket);
    },
    onError: (err: any) => {
      options?.onError?.(err);
    },
  });
}

export function useAddReplyMutation(
  ticketId: string,
  options?: {
    onSuccess?: (message: any) => void;
    onError?: (err: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: string | { body: string; files?: File[] }) => {
      if (typeof payload === 'string') {
        return ticketApi.addReply(ticketId, payload);
      }
      return ticketApi.addReply(ticketId, payload.body, payload.files);
    },
    onSuccess: (msg) => {
      toast.success('Reply submitted to customer');
      queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() });
      options?.onSuccess?.(msg);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit reply');
      options?.onError?.(err);
    },
  });
}

export function useUpdateTicketStatusMutation(
  ticketId: string,
  options?: {
    onSuccess?: (updated: any) => void;
    onError?: (err: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TicketStatus) => ticketApi.updateStatus(ticketId, status),
    onSuccess: (updated) => {
      toast.success(`Ticket status updated to ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      options?.onSuccess?.(updated);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update status');
      options?.onError?.(err);
    },
  });
}

export function useReassignTicketMutation(
  ticketId: string,
  options?: {
    onSuccess?: (updated: any) => void;
    onError?: (err: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: string) => ticketApi.reassignTicket(ticketId, assigneeId),
    onSuccess: (updated) => {
      toast.success(
        updated.assignee
          ? `Ticket assigned to ${updated.assignee.name}`
          : 'Ticket moved to Unassigned queue'
      );
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.timeline(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      options?.onSuccess?.(updated);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to reassign ticket');
      options?.onError?.(err);
    },
  });
}

export function useAnalyzeTicketMutation(
  ticketId: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (err: any) => void;
  }
) {
  return useMutation({
    mutationFn: () => ticketApi.analyzeTicket(ticketId),
    onSuccess: (data) => {
      toast.success('AI ticket analysis complete');
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      toast.error(err.message || 'AI analysis temporarily unavailable');
      options?.onError?.(err);
    },
  });
}

export function useSummarizeTicketMutation(
  ticketId: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (err: any) => void;
  }
) {
  return useMutation({
    mutationFn: () => ticketApi.summarizeTicket(ticketId),
    onSuccess: (data) => {
      toast.success('AI ticket summary generated');
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      toast.error(err.message || 'AI summarization temporarily unavailable');
      options?.onError?.(err);
    },
  });
}

export function useAiDraftMutation(
  ticketId: string,
  options?: {
    onSuccess?: (data: { draft: string }) => void;
    onError?: (err: any) => void;
  }
) {
  return useMutation({
    mutationFn: () => ticketApi.generateAiDraft(ticketId),
    onSuccess: (data) => {
      toast.success('AI draft reply generated! Review before sending.');
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      toast.error(err.message || 'AI draft reply temporarily unavailable. Please compose manually.');
      options?.onError?.(err);
    },
  });
}

