import {
  TicketResponseDto,
  PublicTicketStatusResponseDto,
  ITicketDocument,
  ITicketMessageDocument,
  ITicketEventDocument,
} from '../types/ticket.types.js';

export class TicketView {
  static renderTicket(ticket: any, latestReply?: any | null): TicketResponseDto {
    const assigneeObj = ticket.assignee;

    return {
      id: ticket._id ? ticket._id.toString() : ticket.id,
      ticketId: ticket.ticketId,
      customer: ticket.customer,
      subject: ticket.subject,
      body: ticket.body,
      priority: ticket.priority,
      status: ticket.status,
      assignee: assigneeObj
        ? {
            id: assigneeObj._id ? assigneeObj._id.toString() : assigneeObj.id,
            name: assigneeObj.name,
            email: assigneeObj.email,
            role: assigneeObj.role,
            isActive: assigneeObj.isActive,
            createdAt: assigneeObj.createdAt ? new Date(assigneeObj.createdAt).toISOString() : '',
          }
        : null,
      closedAt: ticket.closedAt ? new Date(ticket.closedAt).toISOString() : null,
      attachments: ticket.attachments || [],
      createdAt: new Date(ticket.createdAt).toISOString(),
      updatedAt: new Date(ticket.updatedAt).toISOString(),
      latestReply: latestReply
        ? {
            senderType: latestReply.senderType,
            senderName: latestReply.senderName,
            body: latestReply.body,
            attachments: latestReply.attachments || [],
            createdAt: new Date(latestReply.createdAt).toISOString(),
          }
        : null,
    };
  }

  static renderTicketList(
    tickets: any[],
    stats: any,
    pagination: { page: number; limit: number; total: number }
  ) {
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

    const formattedTickets: TicketResponseDto[] = tickets.map((t) => this.renderTicket(t));

    return {
      tickets: formattedTickets,
      stats,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
      },
    };
  }

  static renderPublicStatus(ticket: any, latestReply?: any | null): PublicTicketStatusResponseDto {
    return {
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: new Date(ticket.createdAt).toISOString(),
      updatedAt: new Date(ticket.updatedAt).toISOString(),
      latestReply: latestReply
        ? {
            senderType: latestReply.senderType,
            senderName: latestReply.senderName,
            body: latestReply.body,
            attachments: latestReply.attachments || [],
            createdAt: new Date(latestReply.createdAt).toISOString(),
          }
        : null,
    };
  }

  static renderTimeline(ticketId: string, messages: any[], events: any[]) {
    return {
      ticketId,
      messages: messages.map((m) => ({
        id: m._id ? m._id.toString() : m.id,
        senderType: m.senderType,
        senderName: m.senderName,
        senderId: m.senderId ? m.senderId.toString() : null,
        body: m.body,
        attachments: m.attachments || [],
        createdAt: new Date(m.createdAt).toISOString(),
      })),
      events: events.map((e) => ({
        id: e._id ? e._id.toString() : e.id,
        type: e.type,
        actor: e.actor,
        metadata: e.metadata,
        createdAt: new Date(e.createdAt).toISOString(),
      })),
    };
  }
}
