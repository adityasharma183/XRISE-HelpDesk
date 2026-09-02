import { useMutation } from '@tanstack/react-query';
import { ticketApi } from '../../tickets/api/ticketApi';
import {
  SubmitTicketFormData,
  CheckStatusFormData,
} from '../../tickets/schemas/ticket.schemas';
import { PublicTicketStatus } from '../../tickets/types/ticket.types';

export function useSubmitPublicTicketMutation(options?: {
  onSuccess?: (data: { ticketId: string; subject: string }) => void;
  onError?: (err: any) => void;
}) {
  return useMutation({
    mutationFn: (data: SubmitTicketFormData) => ticketApi.submitPublicTicket(data),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      options?.onError?.(err);
    },
  });
}

export function useCheckPublicStatusMutation(options?: {
  onSuccess?: (data: PublicTicketStatus) => void;
  onError?: (err: any) => void;
}) {
  return useMutation({
    mutationFn: (data: CheckStatusFormData) => ticketApi.checkPublicStatus(data),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      options?.onError?.(err);
    },
  });
}
