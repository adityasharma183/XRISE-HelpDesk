import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger.js';
import { SocketEventPayload } from './socketTypes.js';

class SocketEmitter {
  private io: SocketIOServer | null = null;

  public init(ioInstance: SocketIOServer): void {
    this.io = ioInstance;
    logger.info('SocketEmitter initialized with Socket.IO instance');
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public emitToRoom<T>(room: string, event: string, payload: SocketEventPayload<T>): void {
    if (!this.io) {
      return;
    }
    try {
      this.io.to(room).emit(event, payload);
      logger.debug({ room, event, ticketId: payload.ticketId }, 'Emitted socket event to room');
    } catch (err) {
      logger.error({ err, room, event }, 'Failed to emit socket event');
    }
  }

  public emitTicketCreated(ticket: any): void {
    const payload: SocketEventPayload = {
      ticketId: ticket.ticketId,
      type: 'CREATED',
      data: ticket,
      timestamp: new Date().toISOString(),
    };

    // Broadcast new ticket to agent dashboard
    this.emitToRoom('agent:dashboard', 'ticket:created', payload);
  }

  public emitStatusChanged(ticketId: string, previousStatus: string, newStatus: string, ticket: any): void {
    const payload: SocketEventPayload = {
      ticketId,
      type: 'STATUS_CHANGED',
      data: {
        previousStatus,
        newStatus,
        ticket,
      },
      timestamp: new Date().toISOString(),
    };

    this.emitToRoom(`ticket:${ticketId}`, 'ticket:status-changed', payload);
    this.emitToRoom('agent:dashboard', 'ticket:status-changed', payload);
  }

  public emitPriorityChanged(ticketId: string, previousPriority: string, newPriority: string, ticket: any): void {
    const payload: SocketEventPayload = {
      ticketId,
      type: 'PRIORITY_CHANGED',
      data: {
        previousPriority,
        newPriority,
        ticket,
      },
      timestamp: new Date().toISOString(),
    };

    this.emitToRoom(`ticket:${ticketId}`, 'ticket:priority-changed', payload);
    this.emitToRoom('agent:dashboard', 'ticket:priority-changed', payload);
  }

  public emitReplyAdded(ticketId: string, message: any): void {
    const payload: SocketEventPayload = {
      ticketId,
      type: 'REPLIED',
      data: message,
      timestamp: new Date().toISOString(),
    };

    this.emitToRoom(`ticket:${ticketId}`, 'ticket:reply-added', payload);
    this.emitToRoom('agent:dashboard', 'ticket:reply-added', payload);
  }

  public emitTicketAssigned(ticketId: string, previousAssignee: string, newAssignee: any, ticket: any): void {
    const payload: SocketEventPayload = {
      ticketId,
      type: 'ASSIGNED',
      data: {
        previousAssignee,
        newAssignee,
        ticket,
      },
      timestamp: new Date().toISOString(),
    };

    this.emitToRoom(`ticket:${ticketId}`, 'ticket:assigned', payload);
    this.emitToRoom('agent:dashboard', 'ticket:assigned', payload);
  }
}

export const socketEmitter = new SocketEmitter();
