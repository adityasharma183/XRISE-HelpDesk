import { Types, FilterQuery } from 'mongoose';
import { TicketModel } from '../models/ticket.model.js';
import { TicketMessageModel } from '../models/ticketMessage.model.js';
import { TicketEventModel } from '../models/ticketEvent.model.js';
import {
  ITicketDocument,
  ITicketMessageDocument,
  ITicketEventDocument,
} from '../types/ticket.types.js';
import { TicketQueryInput } from '../schemas/ticket.schema.js';

export class TicketRepository {
  static async createTicket(data: Partial<ITicketDocument>): Promise<ITicketDocument> {
    return TicketModel.create(data);
  }

  static async findByTicketId(ticketId: string): Promise<ITicketDocument | null> {
    return TicketModel.findOne({ ticketId: ticketId.toUpperCase() })
      .populate('assignee', 'name email role isActive')
      .exec();
  }

  static async findByTicketIdAndEmail(ticketId: string, email: string): Promise<ITicketDocument | null> {
    return TicketModel.findOne({
      ticketId: ticketId.toUpperCase(),
      'customer.email': email.toLowerCase(),
    }).exec();
  }

  static async findTicketsWithPagination(
    filter: FilterQuery<ITicketDocument>,
    query: TicketQueryInput
  ): Promise<{ tickets: ITicketDocument[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const mongoFilter: FilterQuery<ITicketDocument> = { ...filter };

    if (query.status) {
      mongoFilter.status = query.status;
    }

    if (query.priority) {
      mongoFilter.priority = query.priority;
    }

    if (query.assignee === 'unassigned') {
      mongoFilter.assignee = null;
    } else if (query.assignee && Types.ObjectId.isValid(query.assignee)) {
      mongoFilter.assignee = new Types.ObjectId(query.assignee);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      mongoFilter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { body: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
      ];
    }

    const [tickets, total] = await Promise.all([
      TicketModel.find(mongoFilter)
        .populate('assignee', 'name email role isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as unknown as Promise<ITicketDocument[]>,
      TicketModel.countDocuments(mongoFilter).exec(),
    ]);

    return { tickets, total };
  }

  static async updateTicketStatus(
    ticketId: string,
    status: string,
    closedAt: Date | null
  ): Promise<ITicketDocument | null> {
    return TicketModel.findOneAndUpdate(
      { ticketId: ticketId.toUpperCase() },
      { $set: { status, closedAt } },
      { new: true }
    )
      .populate('assignee', 'name email role isActive')
      .exec();
  }

  static async updateTicketAssignee(
    ticketId: string,
    assigneeId: Types.ObjectId
  ): Promise<ITicketDocument | null> {
    return TicketModel.findOneAndUpdate(
      { ticketId: ticketId.toUpperCase() },
      { $set: { assignee: assigneeId } },
      { new: true }
    )
      .populate('assignee', 'name email role isActive')
      .exec();
  }

  static async getLastAssignedTicket(agentIds?: Types.ObjectId[]): Promise<ITicketDocument | null> {
    const filter: any = { assignee: { $ne: null } };
    if (agentIds && agentIds.length > 0) {
      filter.assignee = { $in: agentIds };
    }
    return TicketModel.findOne(filter)
      .sort({ createdAt: -1, _id: -1 })
      .exec();
  }

  static async getTicketStats(filter: FilterQuery<ITicketDocument>) {
    const counts = await TicketModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };

    counts.forEach((item) => {
      stats.total += item.count;
      if (item._id === 'OPEN') stats.open = item.count;
      if (item._id === 'IN_PROGRESS') stats.inProgress = item.count;
      if (item._id === 'RESOLVED') stats.resolved = item.count;
      if (item._id === 'CLOSED') stats.closed = item.count;
    });

    return stats;
  }

  // --- Messages & Events ---

  static async createMessage(data: Partial<ITicketMessageDocument>): Promise<ITicketMessageDocument> {
    return TicketMessageModel.create(data);
  }

  static async getMessagesByTicketId(ticketId: string): Promise<ITicketMessageDocument[]> {
    return TicketMessageModel.find({ ticketId: ticketId.toUpperCase() })
      .sort({ createdAt: 1 })
      .lean()
      .exec() as unknown as Promise<ITicketMessageDocument[]>;
  }

  static async getLatestAgentReply(ticketId: string): Promise<ITicketMessageDocument | null> {
    return TicketMessageModel.findOne({
      ticketId: ticketId.toUpperCase(),
      senderType: 'AGENT',
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as unknown as Promise<ITicketMessageDocument | null>;
  }

  static async createEvent(data: Partial<ITicketEventDocument>): Promise<ITicketEventDocument> {
    return TicketEventModel.create(data);
  }

  static async getEventsByTicketId(ticketId: string): Promise<ITicketEventDocument[]> {
    return TicketEventModel.find({ ticketId: ticketId.toUpperCase() })
      .sort({ createdAt: 1 })
      .lean()
      .exec() as unknown as Promise<ITicketEventDocument[]>;
  }

  // --- AI Cache Management ---

  static async updateAiAnalysis(ticketId: string, analysis: any): Promise<void> {
    await TicketModel.updateOne(
      { ticketId: ticketId.toUpperCase() },
      { $set: { 'aiCache.analysis': { ...analysis, analyzedAt: new Date() } } }
    );
  }

  static async updateAiSummary(
    ticketId: string,
    summary: any,
    messagesCount: number,
    status: string
  ): Promise<void> {
    await TicketModel.updateOne(
      { ticketId: ticketId.toUpperCase() },
      {
        $set: {
          'aiCache.summary': {
            ...summary,
            summarizedAt: new Date(),
            messagesCountAtSummary: messagesCount,
            statusAtSummary: status,
          },
        },
      }
    );
  }

  static async invalidateAiSummary(ticketId: string): Promise<void> {
    await TicketModel.updateOne(
      { ticketId: ticketId.toUpperCase() },
      { $set: { 'aiCache.summary': null } }
    );
  }
}

