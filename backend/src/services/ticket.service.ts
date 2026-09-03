import { Types, FilterQuery } from 'mongoose';
import { TicketRepository } from '../repositories/ticket.repository.js';
import { UserModel } from '../models/user.model.js';
import { generateTicketId } from '../utils/ticketId.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';
import {
  TicketResponseDto,
  PublicTicketStatusResponseDto,
  ITicketDocument,
  IAttachmentMeta,
} from '../types/ticket.types.js';
import {
  CreateTicketInput,
  TicketQueryInput,
} from '../schemas/ticket.schema.js';
import { IUserDocument } from '../types/user.types.js';
import { TicketView } from '../views/ticket.view.js';
import { AiService } from '../modules/ai/index.js';
import { emailService } from './email.service.js';
import { UploadService } from './upload.service.js';

export class TicketService {
  /**
   * 1. Public Ticket Submission
   * Customers submit support requests without needing to log in.
   * Generates a unique tracking ID (e.g. XR-9A2K4B), records initial conversation payload,
   * and logs an immutable audit event for compliance.
   */
  static async createPublicTicket(
    input: CreateTicketInput,
    files?: Express.Multer.File[]
  ): Promise<{ ticketId: string; subject: string }> {
    const ticketId = generateTicketId();
    const attachments: IAttachmentMeta[] = files && files.length > 0
      ? await UploadService.uploadFiles(files)
      : [];

    await TicketRepository.createTicket({
      ticketId,
      customer: {
        name: input.name,
        email: input.email.toLowerCase(),
      },
      subject: input.subject,
      body: input.body,
      priority: input.priority,
      status: 'OPEN',
      assignee: null,
      attachments,
    });

    // Save the initial customer submission into the message history
    await TicketRepository.createMessage({
      ticketId,
      senderType: 'CUSTOMER',
      senderName: input.name,
      body: input.body,
      attachments,
    });

    // Record CREATED audit event for compliance and chronological tracking
    await TicketRepository.createEvent({
      ticketId,
      type: 'CREATED',
      actor: {
        name: input.name,
        role: 'CUSTOMER',
      },
      metadata: {
        priority: input.priority,
        subject: input.subject,
      },
    });

    logger.info({ ticketId, customerEmail: input.email }, 'Public support ticket created');

    // Return only ticketId and subject — the ticket object itself isn't needed by the public form
    const ticket = await TicketRepository.findByTicketId(ticketId);
    return {
      ticketId: ticket!.ticketId,
      subject: ticket!.subject,
    };
  }

  /**
   * 2. Public Ticket Status Verification
   * Requires matching both Ticket ID and Customer Email to prevent information leakage
   * or ticket scraping by unauthorized third parties.
   */
  static async getPublicTicketStatus(ticketId: string, email: string): Promise<PublicTicketStatusResponseDto> {
    const ticket = await TicketRepository.findByTicketIdAndEmail(ticketId, email);

    if (!ticket) {
      logger.warn({ ticketId, email }, 'Public status check failed: Ticket not found for given email');
      throw ApiError.ticketNotFound('No matching ticket found for the provided Ticket ID and Email.');
    }

    const latestAgentReply = await TicketRepository.getLatestAgentReply(ticket.ticketId);

    return TicketView.renderPublicStatus(ticket, latestAgentReply);
  }

  /**
   * 3. Internal Ticket List Query
   * Enforces strict database-level query scoping:
   * - Support Agents can ONLY fetch tickets assigned to them ({ assignee: user._id })
   * - Master Administrators have unrestricted global visibility across all queues
   */
  static async getTickets(query: TicketQueryInput, user: IUserDocument) {
    const filter: FilterQuery<ITicketDocument> = {};

    // Security Rule: Filter tickets by assignee if user is an agent
    if (user.role === 'AGENT') {
      filter.assignee = user._id;
    }

    const { tickets, total } = await TicketRepository.findTicketsWithPagination(filter, query);
    const stats = await TicketRepository.getTicketStats(filter);

    const page = query.page || 1;
    const limit = query.limit || 20;

    return TicketView.renderTicketList(tickets, stats, { page, limit, total });
  }

  /**
   * 4. Internal Ticket Details
   * Verifies access authorization before returning detailed ticket context and metadata.
   */
  static async getTicketById(ticketId: string, user: IUserDocument): Promise<TicketResponseDto> {
    const ticket = await TicketRepository.findByTicketId(ticketId);

    if (!ticket) {
      throw ApiError.ticketNotFound(`Ticket ${ticketId} not found.`);
    }

    // Role check: Agents can only view tickets assigned to themselves
    if (user.role === 'AGENT' && (!ticket.assignee || ticket.assignee._id.toString() !== user._id.toString())) {
      logger.warn({ ticketId, userId: user._id, role: user.role }, 'Unauthorized ticket access attempt');
      throw ApiError.forbidden('You do not have permission to access this ticket.');
    }

    const latestReply = await TicketRepository.getLatestAgentReply(ticket.ticketId);

    return TicketView.renderTicket(ticket, latestReply);
  }

  /**
   * 5. Unified Ticket Timeline & Messages
   */
  static async getTicketTimeline(ticketId: string, user: IUserDocument) {
    // Check authorization first
    await this.getTicketById(ticketId, user);

    const [messages, events] = await Promise.all([
      TicketRepository.getMessagesByTicketId(ticketId),
      TicketRepository.getEventsByTicketId(ticketId),
    ]);

    return TicketView.renderTimeline(ticketId, messages, events);
  }

  /**
   * 6. Agent / Admin Reply
   */
  static async addReply(
    ticketId: string,
    body: string,
    user: IUserDocument,
    files?: Express.Multer.File[]
  ) {
    const ticket = await this.getTicketById(ticketId, user);
    const attachments: IAttachmentMeta[] = files && files.length > 0
      ? await UploadService.uploadFiles(files)
      : [];

    const message = await TicketRepository.createMessage({
      ticketId: ticket.ticketId,
      senderType: 'AGENT',
      senderId: user._id,
      senderName: user.name,
      body,
      attachments,
    });

    await TicketRepository.createEvent({
      ticketId: ticket.ticketId,
      type: 'REPLIED',
      actor: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      metadata: {
        replyId: message._id,
      },
    });

    logger.info({ ticketId: ticket.ticketId, userId: user._id }, 'Agent reply added to ticket');

    // Invalidate cached AI summary on new conversation activity
    await TicketRepository.invalidateAiSummary(ticket.ticketId);

    return {
      id: message._id.toString(),
      ticketId: message.ticketId,
      senderType: message.senderType,
      senderId: user._id.toString(),
      senderName: user.name,
      body: message.body,
      attachments: message.attachments ?? [],
      createdAt: message.createdAt.toISOString(),
    };
  }

  /**
   * 7. Change Ticket Status
   */
  static async updateStatus(ticketId: string, newStatus: string, user: IUserDocument) {
    const ticket = await this.getTicketById(ticketId, user);
    const previousStatus = ticket.status;

    if (previousStatus === newStatus) {
      return ticket;
    }

    const closedAt = newStatus === 'CLOSED' ? new Date() : null;

    const updated = await TicketRepository.updateTicketStatus(ticketId, newStatus, closedAt);

    if (!updated) {
      throw ApiError.ticketNotFound('Failed to update ticket status');
    }

    // Invalidate cached AI summary on status transition
    await TicketRepository.invalidateAiSummary(ticket.ticketId);

    await TicketRepository.createEvent({
      ticketId: ticket.ticketId,
      type: 'STATUS_CHANGED',
      actor: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      metadata: {
        previousStatus,
        newStatus,
      },
    });

    logger.info(
      { ticketId: ticket.ticketId, previousStatus, newStatus, userId: user._id },
      'Ticket status updated'
    );

    // Send resolution or closure email to the customer (fire-and-forget — errors are caught inside)
    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      const fullTicket = await TicketRepository.findByTicketId(ticket.ticketId);
      const latestReply = await TicketRepository.getLatestAgentReply(ticket.ticketId);

      if (fullTicket) {
        emailService.sendResolutionEmail({
          customerName: fullTicket.customer.name,
          customerEmail: fullTicket.customer.email,
          ticketId: fullTicket.ticketId,
          subject: fullTicket.subject,
          status: newStatus as 'RESOLVED' | 'CLOSED',
          latestAgentReply: latestReply?.body ?? null,
        });
      }
    }

    return this.getTicketById(ticketId, user);
  }

  /**
   * Helper: Get next active agent in Round-Robin rotation
   */
  static async getNextRoundRobinAgent(): Promise<IUserDocument | null> {
    const activeAgents = (await UserModel.find({ role: 'AGENT', isActive: true })
      .sort({ createdAt: 1, _id: 1 })
      .lean<IUserDocument[]>()
      .exec()) as unknown as IUserDocument[];

    if (!activeAgents || activeAgents.length === 0) {
      return null;
    }

    if (activeAgents.length === 1) {
      return activeAgents[0] ?? null;
    }

    const lastAssignedTicket = await TicketRepository.getLastAssignedTicket(
      activeAgents.map((a) => a._id)
    );

    if (!lastAssignedTicket || !lastAssignedTicket.assignee) {
      return activeAgents[0] ?? null;
    }

    const lastAssigneeIdStr = (
      (lastAssignedTicket.assignee as any)._id || lastAssignedTicket.assignee
    ).toString();

    const lastIndex = activeAgents.findIndex(
      (a) => a._id.toString() === lastAssigneeIdStr
    );

    if (lastIndex === -1) {
      return activeAgents[0] ?? null;
    }

    const nextIndex = (lastIndex + 1) % activeAgents.length;
    return activeAgents[nextIndex] ?? null;
  }

  /**
   * 8. Admin Reassignment / Assignment (Supports explicit agent ID, 'unassigned', or 'round-robin')
   */
  static async reassignTicket(ticketId: string, assigneeId: string | null, adminUser: IUserDocument) {
    if (adminUser.role !== 'ADMIN') {
      throw ApiError.forbidden('Only administrators can reassign tickets.');
    }

    const ticket = await TicketRepository.findByTicketId(ticketId);
    if (!ticket) {
      throw ApiError.ticketNotFound(`Ticket ${ticketId} not found.`);
    }

    const previousAssigneeName = (ticket.assignee as any)?.name || 'Unassigned';

    // Handle round-robin auto assignment
    let targetAssigneeId = assigneeId;
    let isRoundRobin = false;

    if (assigneeId === 'round-robin') {
      const nextAgent = await this.getNextRoundRobinAgent();
      if (!nextAgent) {
        throw ApiError.badRequest('No active agents available for round-robin assignment.');
      }
      targetAssigneeId = nextAgent._id.toString();
      isRoundRobin = true;
    }

    // Unassign if null or 'unassigned'
    if (!targetAssigneeId || targetAssigneeId === 'unassigned') {
      const updated = await TicketRepository.updateTicketAssignee(ticketId, null as any);
      if (!updated) {
        throw ApiError.internal('Failed to update ticket assignee.');
      }

      await TicketRepository.createEvent({
        ticketId: ticket.ticketId,
        type: 'REASSIGNED',
        actor: {
          id: adminUser._id,
          name: adminUser.name,
          role: adminUser.role,
        },
        metadata: {
          previousAssignee: previousAssigneeName,
          newAssigneeId: null,
          newAssigneeName: 'Unassigned',
        },
      });

      return this.getTicketById(ticketId, adminUser);
    }

    const targetUser = await UserModel.findById(targetAssigneeId);
    if (!targetUser || !targetUser.isActive) {
      throw ApiError.agentNotFound('Target assignee user does not exist or is inactive.');
    }

    const updated = await TicketRepository.updateTicketAssignee(
      ticketId,
      new Types.ObjectId(targetAssigneeId)
    );

    if (!updated) {
      throw ApiError.internal('Failed to update ticket assignee.');
    }

    await TicketRepository.createEvent({
      ticketId: ticket.ticketId,
      type: 'REASSIGNED',
      actor: {
        id: adminUser._id,
        name: adminUser.name,
        role: adminUser.role,
      },
      metadata: {
        previousAssignee: previousAssigneeName,
        newAssigneeId: targetUser._id,
        newAssigneeName: targetUser.name,
        method: isRoundRobin ? 'ROUND_ROBIN' : 'MANUAL',
      },
    });

    logger.info(
      {
        ticketId: ticket.ticketId,
        previousAssignee: previousAssigneeName,
        newAssignee: targetUser.name,
        adminId: adminUser._id,
        method: isRoundRobin ? 'ROUND_ROBIN' : 'MANUAL',
      },
      'Ticket reassigned successfully by Admin'
    );

    return this.getTicketById(ticketId, adminUser);
  }

  /**
   * 9. Internal Ticket Creation (with Optional Instant Assignment or Round-Robin)
   */
  static async createInternalTicket(
    input: {
      name: string;
      email: string;
      subject: string;
      body: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      assigneeId?: string | null;
    },
    creatorUser: IUserDocument,
    files?: Express.Multer.File[]
  ) {
    const ticketId = generateTicketId();
    const attachments: IAttachmentMeta[] = files && files.length > 0
      ? await UploadService.uploadFiles(files)
      : [];

    let assigneeObjectId: Types.ObjectId | null = null;
    let targetUser: any = null;
    let isRoundRobin = false;

    if (input.assigneeId === 'round-robin') {
      const nextAgent = await this.getNextRoundRobinAgent();
      if (nextAgent && nextAgent.isActive) {
        targetUser = nextAgent;
        assigneeObjectId = nextAgent._id;
        isRoundRobin = true;
      }
    } else if (input.assigneeId && input.assigneeId !== 'unassigned') {
      targetUser = await UserModel.findById(input.assigneeId);
      if (targetUser && targetUser.isActive) {
        assigneeObjectId = targetUser._id;
      }
    }

    const ticket = await TicketRepository.createTicket({
      ticketId,
      customer: {
        name: input.name,
        email: input.email.toLowerCase(),
      },
      subject: input.subject,
      body: input.body,
      priority: input.priority,
      status: 'OPEN',
      assignee: assigneeObjectId,
      attachments,
    });

    // Create initial message
    await TicketRepository.createMessage({
      ticketId,
      senderType: 'CUSTOMER',
      senderName: input.name,
      body: input.body,
      attachments,
    });

    // Record CREATED audit event
    await TicketRepository.createEvent({
      ticketId,
      type: 'CREATED',
      actor: {
        id: creatorUser._id,
        name: creatorUser.name,
        role: creatorUser.role,
      },
      metadata: {
        priority: input.priority,
        subject: input.subject,
        assigneeId: assigneeObjectId,
        assigneeName: targetUser?.name || null,
      },
    });

    if (assigneeObjectId && targetUser) {
      await TicketRepository.createEvent({
        ticketId,
        type: 'ASSIGNED',
        actor: {
          id: creatorUser._id,
          name: creatorUser.name,
          role: creatorUser.role,
        },
        metadata: {
          assigneeId: targetUser._id,
          assigneeName: targetUser.name,
        },
      });
    }

    logger.info(
      { ticketId, creatorId: creatorUser._id, assigneeId: assigneeObjectId },
      'Internal support ticket created by staff'
    );

    return this.getTicketById(ticketId, creatorUser);
  }

  /**
   * 8. AI: Smart Ticket Analysis
   */
  static async analyzeTicketWithAi(ticketId: string, user: IUserDocument) {
    return AiService.analyzeTicket(ticketId, user);
  }

  /**
   * 9. AI: Ticket Summary
   */
  static async summarizeTicketWithAi(ticketId: string, user: IUserDocument) {
    return AiService.summarizeTicket(ticketId, user);
  }

  /**
   * 10. AI: Draft Reply
   */
  static async generateAiDraft(ticketId: string, user: IUserDocument) {
    return AiService.generateTicketDraftReply(ticketId, user);
  }
}
