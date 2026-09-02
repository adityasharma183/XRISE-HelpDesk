import { Document, Types } from 'mongoose';
import { UserResponseDto } from './user.types.js';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MessageSenderType = 'CUSTOMER' | 'AGENT';
export type TicketEventType = 'CREATED' | 'ASSIGNED' | 'REASSIGNED' | 'REPLIED' | 'STATUS_CHANGED';

export interface ITicketCustomer {
  name: string;
  email: string;
}

export interface ITicketAiAnalysisCache {
  category: string;
  suggestedPriority: string;
  sentiment: string;
  reason: string;
  analyzedAt: Date;
}

export interface ITicketAiSummaryCache {
  summary: string;
  mainProblem: string;
  keyContext?: string;
  actionsTaken?: string;
  currentState: string;
  suggestedNextStep: string;
  summarizedAt: Date;
  messagesCountAtSummary: number;
  statusAtSummary: string;
}

export interface ITicketAiCache {
  analysis?: ITicketAiAnalysisCache | null;
  summary?: ITicketAiSummaryCache | null;
}

export interface ITicket {
  ticketId: string;
  customer: ITicketCustomer;
  subject: string;
  body: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: Types.ObjectId | null;
  closedAt?: Date | null;
  aiCache?: ITicketAiCache | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface ITicketDocument extends ITicket, Document {
  _id: Types.ObjectId;
}

export interface ITicketMessage {
  ticketId: string;
  senderType: MessageSenderType;
  senderId?: Types.ObjectId | null;
  senderName: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketMessageDocument extends ITicketMessage, Document {
  _id: Types.ObjectId;
}

export interface ITicketEventActor {
  id?: Types.ObjectId | null;
  name: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN' | 'SYSTEM';
}

export interface ITicketEvent {
  ticketId: string;
  type: TicketEventType;
  actor: ITicketEventActor;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ITicketEventDocument extends ITicketEvent, Document {
  _id: Types.ObjectId;
}

// Response DTOs
export interface TicketResponseDto {
  id: string;
  ticketId: string;
  customer: ITicketCustomer;
  subject: string;
  body: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: UserResponseDto | null;
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

export interface PublicTicketStatusResponseDto {
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
