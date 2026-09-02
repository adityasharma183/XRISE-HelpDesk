import { User } from '../../auth/types/auth.types';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MessageSenderType = 'CUSTOMER' | 'AGENT';
export type TicketEventType = 'CREATED' | 'ASSIGNED' | 'REASSIGNED' | 'REPLIED' | 'STATUS_CHANGED';

export interface TicketCustomer {
  name: string;
  email: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: MessageSenderType;
  senderId?: string | null;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface TicketEvent {
  id: string;
  type: TicketEventType;
  actor: {
    id?: string | null;
    name: string;
    role: 'CUSTOMER' | 'AGENT' | 'ADMIN' | 'SYSTEM';
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  customer: TicketCustomer;
  subject: string;
  body: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: User | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  latestReply?: {
    senderType: MessageSenderType;
    senderName: string;
    body: string;
    createdAt: string;
  } | null;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
}

export interface PublicTicketStatus {
  ticketId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  latestReply?: {
    senderType: MessageSenderType;
    senderName: string;
    body: string;
    createdAt: string;
  } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AiCategory =
  | 'ACCOUNT'
  | 'BILLING'
  | 'PAYMENT'
  | 'TECHNICAL'
  | 'SECURITY'
  | 'FEATURE_REQUEST'
  | 'GENERAL';

export type AiSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface AiAnalysisResult {
  category: AiCategory;
  suggestedPriority: TicketPriority;
  sentiment: AiSentiment;
  reason: string;
}

export interface AiSummaryResult {
  summary: string;
  mainProblem: string;
  keyContext?: string;
  actionsTaken?: string;
  currentState: string;
  suggestedNextStep: string;
}

export interface AiDraftResult {
  draft: string;
}


