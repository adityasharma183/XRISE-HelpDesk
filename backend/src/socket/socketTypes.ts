export type SocketEventType =
  | 'ticket:created'
  | 'ticket:status-changed'
  | 'ticket:priority-changed'
  | 'ticket:assigned'
  | 'ticket:reply-added'
  | 'ticket:updated';

export interface SocketEventPayload<T = any> {
  ticketId: string;
  type: string;
  data: T;
  timestamp: string;
}

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
}
