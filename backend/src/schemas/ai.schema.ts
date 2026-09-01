import { z } from 'zod';

export const aiCategoryEnum = z.enum([
  'ACCOUNT',
  'BILLING',
  'PAYMENT',
  'TECHNICAL',
  'SECURITY',
  'FEATURE_REQUEST',
  'GENERAL',
]);

export const aiPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const aiSentimentEnum = z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']);

export const aiAnalysisSchema = z.object({
  category: aiCategoryEnum,
  suggestedPriority: aiPriorityEnum,
  sentiment: aiSentimentEnum,
  reason: z.string().min(1, 'Reasoning must not be empty'),
});

export const aiSummarySchema = z.object({
  summary: z.string().min(1, 'Summary must not be empty'),
  mainProblem: z.string().min(1, 'Main problem must not be empty'),
  keyContext: z.string().optional().default(''),
  actionsTaken: z.string().optional().default(''),
  currentState: z.string().min(1, 'Current state must not be empty'),
  suggestedNextStep: z.string().min(1, 'Suggested next step must not be empty'),
});

export const aiDraftSchema = z.object({
  draft: z.string().min(1, 'Draft reply must not be empty'),
});

export type AiAnalysisSchemaType = z.infer<typeof aiAnalysisSchema>;
export type AiSummarySchemaType = z.infer<typeof aiSummarySchema>;
export type AiDraftSchemaType = z.infer<typeof aiDraftSchema>;
