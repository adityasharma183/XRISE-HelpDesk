import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class TicketController {
  // Public ticket submission
  static async createPublicTicket(req: Request, res: Response) {
    const result = await TicketService.createPublicTicket(req.body);
    return ApiResponse.success(res, result, 201);
  }

  // Public status check
  static async getPublicStatus(req: Request, res: Response) {
    const { ticketId, email } = req.body;
    const result = await TicketService.getPublicTicketStatus(ticketId, email);
    return ApiResponse.success(res, result);
  }

  // Internal ticket listing
  static async getTickets(req: Request, res: Response) {
    const result = await TicketService.getTickets(
      req.query as any,
      req.user!
    );
    return res.status(200).json({
      success: true,
      data: result.tickets,
      stats: result.stats,
      pagination: result.pagination,
    });
  }

  // Internal single ticket detail
  static async getTicketById(req: Request, res: Response) {
    const { ticketId } = req.params;
    const ticket = await TicketService.getTicketById(ticketId!, req.user!);
    return ApiResponse.success(res, ticket);
  }

  // Internal ticket timeline & messages
  static async getTimeline(req: Request, res: Response) {
    const { ticketId } = req.params;
    const timeline = await TicketService.getTicketTimeline(ticketId!, req.user!);
    return ApiResponse.success(res, timeline);
  }

  // Add agent reply
  static async addReply(req: Request, res: Response) {
    const { ticketId } = req.params;
    const { body } = req.body;
    const message = await TicketService.addReply(ticketId!, body, req.user!);
    return ApiResponse.success(res, message, 201);
  }

  // Update ticket status
  static async updateStatus(req: Request, res: Response) {
    const { ticketId } = req.params;
    const { status } = req.body;
    const updatedTicket = await TicketService.updateStatus(ticketId!, status, req.user!);
    return ApiResponse.success(res, updatedTicket);
  }

  // Admin reassign ticket
  static async reassignTicket(req: Request, res: Response) {
    const { ticketId } = req.params;
    const { assigneeId } = req.body;
    const updatedTicket = await TicketService.reassignTicket(ticketId!, assigneeId, req.user!);
    return ApiResponse.success(res, updatedTicket);
  }

  // Admin / Staff internal ticket creation
  static async createInternalTicket(req: Request, res: Response) {
    const result = await TicketService.createInternalTicket(req.body, req.user!);
    return ApiResponse.success(res, result, 201);
  }

  // AI: Smart Ticket Analysis
  static async analyzeTicket(req: Request, res: Response) {
    const { ticketId } = req.params;
    const result = await TicketService.analyzeTicketWithAi(ticketId!, req.user!);
    return ApiResponse.success(res, result);
  }

  // AI: Ticket Summary
  static async summarizeTicket(req: Request, res: Response) {
    const { ticketId } = req.params;
    const result = await TicketService.summarizeTicketWithAi(ticketId!, req.user!);
    return ApiResponse.success(res, result);
  }

  // AI: Draft Reply
  static async generateAiDraft(req: Request, res: Response) {
    const { ticketId } = req.params;
    const result = await TicketService.generateAiDraft(ticketId!, req.user!);
    return ApiResponse.success(res, result);
  }
}

