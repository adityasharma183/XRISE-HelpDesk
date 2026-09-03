import { apiClient } from '../../../lib/apiClient';
import {
  Ticket,
  TicketPriority,
  TicketStats,
  TicketQueryParams,
  PublicTicketStatus,
  TicketMessage,
  TicketEvent,
  AiAnalysisResult,
  AiSummaryResult,
} from '../types/ticket.types';
import {
  SubmitTicketFormData,
  CheckStatusFormData,
} from '../schemas/ticket.schemas';

export const ticketApi = {
  // Public
  submitPublicTicket: async (
    data: SubmitTicketFormData,
    files?: File[]
  ): Promise<{ ticketId: string; subject: string }> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('body', data.body);
      formData.append('priority', data.priority);
      files.forEach((file) => formData.append('attachments', file));

      const res = await apiClient.post('/public/tickets', formData);
      return res.data.data;
    }

    const res = await apiClient.post('/public/tickets', data);
    return res.data.data;
  },

  checkPublicStatus: async (data: CheckStatusFormData): Promise<PublicTicketStatus> => {
    const res = await apiClient.post('/public/tickets/status', data);
    return res.data.data;
  },

  // Internal (Agent & Admin)
  createInternalTicket: async (
    data: {
      name: string;
      email: string;
      subject: string;
      body: string;
      priority: TicketPriority;
      assigneeId?: string | null;
    },
    files?: File[]
  ): Promise<Ticket> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('body', data.body);
      formData.append('priority', data.priority);
      if (data.assigneeId) {
        formData.append('assigneeId', data.assigneeId);
      }
      files.forEach((file) => formData.append('attachments', file));

      const res = await apiClient.post('/tickets', formData);
      return res.data.data;
    }

    const res = await apiClient.post('/tickets', data);
    return res.data.data;
  },

  getTickets: async (params?: TicketQueryParams): Promise<{
    tickets: Ticket[];
    stats: TicketStats;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const res = await apiClient.get('/tickets', { params });
    return {
      tickets: res.data.data,
      stats: res.data.stats,
      pagination: res.data.pagination,
    };
  },

  getTicketById: async (ticketId: string): Promise<Ticket> => {
    const res = await apiClient.get(`/tickets/${ticketId}`);
    return res.data.data;
  },

  getTicketTimeline: async (ticketId: string): Promise<{
    ticketId: string;
    messages: TicketMessage[];
    events: TicketEvent[];
  }> => {
    const res = await apiClient.get(`/tickets/${ticketId}/timeline`);
    return res.data.data;
  },

  addReply: async (ticketId: string, body: string, files?: File[]): Promise<TicketMessage> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('body', body);
      files.forEach((file) => formData.append('attachments', file));

      const res = await apiClient.post(`/tickets/${ticketId}/replies`, formData);
      return res.data.data;
    }

    const res = await apiClient.post(`/tickets/${ticketId}/replies`, { body });
    return res.data.data;
  },

  updateStatus: async (ticketId: string, status: string): Promise<Ticket> => {
    const res = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
    return res.data.data;
  },

  reassignTicket: async (ticketId: string, assigneeId: string): Promise<Ticket> => {
    const res = await apiClient.patch(`/tickets/${ticketId}/assignee`, { assigneeId });
    return res.data.data;
  },

  // AI Endpoints
  analyzeTicket: async (ticketId: string): Promise<AiAnalysisResult> => {
    const res = await apiClient.post(`/tickets/${ticketId}/ai/analyze`);
    return res.data.data;
  },

  summarizeTicket: async (ticketId: string): Promise<AiSummaryResult> => {
    const res = await apiClient.post(`/tickets/${ticketId}/ai/summarize`);
    return res.data.data;
  },

  generateAiDraft: async (ticketId: string): Promise<{ draft: string }> => {
    const res = await apiClient.post(`/tickets/${ticketId}/ai/draft`);
    return res.data.data;
  },
};

