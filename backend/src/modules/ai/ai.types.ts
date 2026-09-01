export type AiCategory =
  | 'ACCOUNT'
  | 'BILLING'
  | 'PAYMENT'
  | 'TECHNICAL'
  | 'SECURITY'
  | 'FEATURE_REQUEST'
  | 'GENERAL';

export type AiPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AiSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface AiAnalysisResult {
  category: AiCategory;
  suggestedPriority: AiPriority;
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

export interface AiTicketContext {
  ticketId: string;
  customerName: string;
  customerEmail?: string;
  subject: string;
  body: string;
  priority: string;
  status: string;
  conversationHistory: {
    senderType: 'CUSTOMER' | 'AGENT';
    senderName: string;
    body: string;
    createdAt: string;
  }[];
}

/**
 * Provider-agnostic interface for AI integrations (e.g. Gemini, OpenAI, Claude, Local LLM)
 */
export interface IAiProvider {
  analyzeTicket(context: AiTicketContext): Promise<AiAnalysisResult>;
  summarizeTicket(context: AiTicketContext): Promise<AiSummaryResult>;
  generateDraftReply(context: AiTicketContext): Promise<string>;
}
