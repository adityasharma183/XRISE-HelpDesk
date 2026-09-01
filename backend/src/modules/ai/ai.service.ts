import { IAiProvider, AiAnalysisResult, AiSummaryResult, AiTicketContext } from './ai.types.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { TicketService } from '../../services/ticket.service.js';
import { IUserDocument } from '../../types/user.types.js';
import { logger } from '../../config/logger.js';


import { TicketRepository } from '../../repositories/ticket.repository.js';
import { TicketModel } from '../../models/ticket.model.js';
import { AiCategory, AiPriority, AiSentiment } from './ai.types.js';

export class AiService {
  private static provider: IAiProvider = new GeminiProvider();

  /**
   * Allows hot-swapping the AI provider (e.g. Gemini, OpenAI, Claude, Mock Provider in tests)
   */
  static setProvider(newProvider: IAiProvider) {
    this.provider = newProvider;
    logger.info('AiService provider updated.');
  }

  static getProvider(): IAiProvider {
    return this.provider;
  }

  /**
   * 1. Smart Ticket Analysis (Cached per ticket content)
   */
  static async analyzeTicket(
    ticketId: string,
    user: IUserDocument,
    forceRefresh: boolean = false
  ): Promise<AiAnalysisResult> {
    // 1. Enforces database query authorization (403 if agent is unauthorized)
    await TicketService.getTicketById(ticketId, user);

    // 2. Check cached analysis if not forcing refresh
    if (!forceRefresh) {
      const ticketDoc = await TicketModel.findOne({ ticketId: ticketId.toUpperCase() }).lean();
      if (ticketDoc?.aiCache?.analysis) {
        logger.info({ ticketId }, 'Returning cached AI ticket analysis');
        return {
          category: ticketDoc.aiCache.analysis.category as AiCategory,
          suggestedPriority: ticketDoc.aiCache.analysis.suggestedPriority as AiPriority,
          sentiment: ticketDoc.aiCache.analysis.sentiment as AiSentiment,
          reason: ticketDoc.aiCache.analysis.reason,
        };
      }
    }

    // 3. Generate fresh analysis via AI Provider
    const context = await this.buildTicketContext(ticketId, user);
    const analysis = await this.provider.analyzeTicket(context);

    // 4. Persist to cache
    await TicketRepository.updateAiAnalysis(ticketId, analysis);
    return analysis;
  }

  /**
   * 2. AI Ticket Summarization (Cached and invalidated on replies / status changes)
   */
  static async summarizeTicket(
    ticketId: string,
    user: IUserDocument,
    forceRefresh: boolean = false
  ): Promise<AiSummaryResult> {
    // 1. Enforces database query authorization
    const ticket = await TicketService.getTicketById(ticketId, user);
    const timeline = await TicketService.getTicketTimeline(ticketId, user);
    const messagesCount = (timeline.messages || []).length;

    // 2. Check cached summary if not forcing refresh and ticket history/status has not changed
    if (!forceRefresh) {
      const ticketDoc = await TicketModel.findOne({ ticketId: ticketId.toUpperCase() }).lean();
      const cached = ticketDoc?.aiCache?.summary;
      if (
        cached &&
        cached.messagesCountAtSummary === messagesCount &&
        cached.statusAtSummary === ticket.status
      ) {
        logger.info({ ticketId }, 'Returning cached AI ticket summary');
        return {
          summary: cached.summary,
          mainProblem: cached.mainProblem,
          keyContext: cached.keyContext,
          actionsTaken: cached.actionsTaken,
          currentState: cached.currentState,
          suggestedNextStep: cached.suggestedNextStep,
        };
      }
    }

    // 3. Generate fresh summary via AI Provider
    const context = await this.buildTicketContext(ticketId, user);
    const summary = await this.provider.summarizeTicket(context);

    // 4. Persist to cache with version bounds (message count and ticket status)
    await TicketRepository.updateAiSummary(ticketId, summary, messagesCount, ticket.status);
    return summary;
  }

  /**
   * 3. AI Reply Draft Generation (Always dynamic based on latest context)
   */
  static async generateTicketDraftReply(
    ticketId: string,
    user: IUserDocument
  ): Promise<{ draft: string }> {
    const context = await this.buildTicketContext(ticketId, user);
    const draft = await this.provider.generateDraftReply(context);
    return { draft };
  }



  /**
   * Helper: Builds sanitized AI context enforcing query authorization & privacy
   */
  private static async buildTicketContext(
    ticketId: string,
    user: IUserDocument
  ): Promise<AiTicketContext> {
    // 1. Enforces database query authorization (403 if agent is unauthorized)
    const ticket = await TicketService.getTicketById(ticketId, user);

    // 2. Fetches recent conversation timeline
    const timeline = await TicketService.getTicketTimeline(ticketId, user);

    // 3. Sanitizes and structures untrusted customer content (capped to last 10 messages)
    const conversationHistory = (timeline.messages || []).slice(-10).map((msg) => ({
      senderType: msg.senderType,
      senderName: msg.senderName,
      body: msg.body,
      createdAt: String(msg.createdAt),
    }));


    return {
      ticketId: ticket.ticketId,
      customerName: ticket.customer.name,
      customerEmail: ticket.customer.email,
      subject: ticket.subject,
      body: ticket.body,
      priority: ticket.priority,
      status: ticket.status,
      conversationHistory,
    };
  }
}
