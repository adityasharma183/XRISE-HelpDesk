import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { testAdmin, testAgent1, testAgent2 } from './setup.js';
import { signToken } from '../src/utils/jwt.js';
import { TicketModel, TicketMessageModel } from '../src/models/index.js';
import './setup.js';

describe('AI Enhancement Layer API & Security', () => {
  const app = createApp();

  const getAgent1Token = () =>
    signToken({
      sub: testAgent1._id.toString(),
      email: testAgent1.email,
      role: testAgent1.role,
      name: testAgent1.name,
    });

  const getAgent2Token = () =>
    signToken({
      sub: testAgent2._id.toString(),
      email: testAgent2.email,
      role: testAgent2.role,
      name: testAgent2.name,
    });

  const getAdminToken = () =>
    signToken({
      sub: testAdmin._id.toString(),
      email: testAdmin.email,
      role: testAdmin.role,
      name: testAdmin.name,
    });

  let agent1TicketId: string;
  let agent2TicketId: string;

  beforeEach(async () => {
    // Seed an assigned ticket for Agent 1
    const t1 = await TicketModel.create({
      ticketId: 'XR-A1TICK',
      customer: { name: 'Alice Cooper', email: 'alice@rock.com' },
      subject: 'I was charged twice for my subscription and need a refund',
      body: 'I checked my credit card statement and see duplicate charges of $49. Please issue a refund immediately.',
      priority: 'HIGH',
      status: 'OPEN',
      assignee: testAgent1._id,
    });
    agent1TicketId = t1.ticketId;

    await TicketMessageModel.create({
      ticketId: t1.ticketId,
      senderType: 'CUSTOMER',
      senderName: 'Alice Cooper',
      body: t1.body,
    });

    // Seed an assigned ticket for Agent 2
    const t2 = await TicketModel.create({
      ticketId: 'XR-A2TICK',
      customer: { name: 'Bob Dylan', email: 'bob@folk.com' },
      subject: 'SSO login loop error with SAML integration',
      body: 'Our enterprise SAML SSO returns error code 500 when redirecting from Okta.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assignee: testAgent2._id,
    });
    agent2TicketId = t2.ticketId;

    await TicketMessageModel.create({
      ticketId: t2.ticketId,
      senderType: 'CUSTOMER',
      senderName: 'Bob Dylan',
      body: t2.body,
    });
  });

  describe('1. Authentication & Authorization Enforcement', () => {
    it('should reject unauthenticated requests to AI analyze endpoint with 401', async () => {
      const res = await request(app).post(`/api/tickets/${agent1TicketId}/ai/analyze`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated requests to AI summarize endpoint with 401', async () => {
      const res = await request(app).post(`/api/tickets/${agent1TicketId}/ai/summarize`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated requests to AI draft endpoint with 401', async () => {
      const res = await request(app).post(`/api/tickets/${agent1TicketId}/ai/draft`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Agent 1 from analyzing Agent 2 assigned ticket (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent2TicketId}/ai/analyze`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('permission');
    });

    it('should prevent Agent 1 from summarizing Agent 2 assigned ticket (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent2TicketId}/ai/summarize`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Agent 1 from generating draft reply for Agent 2 ticket (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent2TicketId}/ai/draft`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if ticketId does not exist', async () => {
      const res = await request(app)
        .post('/api/tickets/XR-NONEXIST/ai/analyze')
        .set('Cookie', [`helpdesk_auth_token=${getAdminToken()}`]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Smart Ticket Analysis', () => {
    it('should allow Agent 1 to analyze own assigned ticket and return structured category, priority, sentiment', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent1TicketId}/ai/analyze`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('category');
      expect(res.body.data).toHaveProperty('suggestedPriority');
      expect(res.body.data).toHaveProperty('sentiment');
      expect(res.body.data).toHaveProperty('reason');

      const validCategories = [
        'ACCOUNT',
        'BILLING',
        'PAYMENT',
        'TECHNICAL',
        'SECURITY',
        'FEATURE_REQUEST',
        'GENERAL',
      ];
      expect(validCategories).toContain(res.body.data.category);
      expect(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).toContain(res.body.data.suggestedPriority);
      expect(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).toContain(res.body.data.sentiment);
    });

    it('should allow Admin to analyze any ticket', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent2TicketId}/ai/analyze`)
        .set('Cookie', [`helpdesk_auth_token=${getAdminToken()}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBeDefined();
    });
  });

  describe('3. AI Ticket Summary', () => {
    it('should return a concise summary with mainProblem, keyContext, currentState, suggestedNextStep', async () => {
      const res = await request(app)
        .post(`/api/tickets/${agent1TicketId}/ai/summarize`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('mainProblem');
      expect(res.body.data).toHaveProperty('currentState');
      expect(res.body.data).toHaveProperty('suggestedNextStep');
      expect(typeof res.body.data.summary).toBe('string');
      expect(res.body.data.summary.length).toBeGreaterThan(10);
    });
  });

  describe('4. AI Draft Reply & Human-in-the-Loop Safeguards', () => {
    it('should generate draft reply text without automatically posting a message to the ticket', async () => {
      const initialMessageCount = await TicketMessageModel.countDocuments({ ticketId: agent1TicketId });

      const res = await request(app)
        .post(`/api/tickets/${agent1TicketId}/ai/draft`)
        .set('Cookie', [`helpdesk_auth_token=${getAgent1Token()}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('draft');
      expect(typeof res.body.data.draft).toBe('string');
      expect(res.body.data.draft.length).toBeGreaterThan(20);

      // Verify no message was added to the database automatically
      const afterMessageCount = await TicketMessageModel.countDocuments({ ticketId: agent1TicketId });
      expect(afterMessageCount).toBe(initialMessageCount);

      // Verify ticket status remained unchanged
      const ticket = await TicketModel.findOne({ ticketId: agent1TicketId });
      expect(ticket?.status).toBe('OPEN');
    });
  });

  describe('5. Structured AI Output & Zod Validation', () => {
    it('should successfully validate valid AI analysis payload with aiAnalysisSchema', async () => {
      const { aiAnalysisSchema } = await import('../src/schemas/ai.schema.js');
      const validPayload = {
        category: 'BILLING',
        suggestedPriority: 'HIGH',
        sentiment: 'NEGATIVE',
        reason: 'Customer reported duplicate charge and requested refund.',
      };

      const result = aiAnalysisSchema.parse(validPayload);
      expect(result).toEqual(validPayload);
    });

    it('should reject invalid category or priority with ZodError', async () => {
      const { aiAnalysisSchema } = await import('../src/schemas/ai.schema.js');
      const invalidPayload = {
        category: 'INVALID_CATEGORY',
        suggestedPriority: 'UNKNOWN_PRIORITY',
        sentiment: 'NEUTRAL',
        reason: 'Some reason',
      };

      expect(() => aiAnalysisSchema.parse(invalidPayload)).toThrow();
    });

    it('should safely handle provider failure without crashing the application', async () => {
      const { AiService } = await import('../src/modules/ai/ai.service.js');
      
      // Simulate a mock provider that throws an error
      const faultyProvider = {
        analyzeTicket: vi.fn().mockRejectedValue(new Error('Simulated Gemini Malformed JSON Error')),
        summarizeTicket: vi.fn().mockRejectedValue(new Error('Simulated Gemini Timeout Error')),
        generateDraftReply: vi.fn().mockRejectedValue(new Error('Simulated Gemini 429 Rate Limit Error')),
      };

      const originalProvider = AiService.getProvider();
      AiService.setProvider(faultyProvider);

      // Verify that calling through endpoint or service handles error safely
      try {
        await AiService.analyzeTicket(agent1TicketId, testAgent1);
      } catch (err: any) {
        expect(err.message).toContain('Simulated Gemini Malformed JSON Error');
      }

      // Restore provider
      AiService.setProvider(originalProvider);
    });
  });

  describe('6. AI Caching & Invalidation Lifecycle', () => {
    it('persists AI analysis to database cache and avoids redundant provider calls', async () => {
      const { AiService } = await import('../src/modules/ai/ai.service.js');
      const mockProvider = {
        analyzeTicket: vi.fn().mockResolvedValue({
          category: 'TECHNICAL',
          suggestedPriority: 'HIGH',
          sentiment: 'NEGATIVE',
          reason: 'Initial classification',
        }),
        summarizeTicket: vi.fn().mockResolvedValue({
          summary: 'Initial Summary',
          mainProblem: 'Initial Problem',
          currentState: 'OPEN',
          suggestedNextStep: 'Investigate',
        }),
        generateDraftReply: vi.fn().mockResolvedValue('Initial Draft'),
      };

      const originalProvider = AiService.getProvider();
      AiService.setProvider(mockProvider);

      // First call invokes provider
      const firstRes = await AiService.analyzeTicket(agent1TicketId, testAgent1);
      expect(mockProvider.analyzeTicket).toHaveBeenCalledTimes(1);
      expect(firstRes.category).toBe('TECHNICAL');

      // Second call returns cached result without invoking provider again
      const secondRes = await AiService.analyzeTicket(agent1TicketId, testAgent1);
      expect(mockProvider.analyzeTicket).toHaveBeenCalledTimes(1); // Call count remains 1!
      expect(secondRes.category).toBe('TECHNICAL');

      AiService.setProvider(originalProvider);
    });

    it('invalidates cached AI summary when a new reply is added to the ticket', async () => {
      const { AiService } = await import('../src/modules/ai/ai.service.js');
      const { TicketService } = await import('../src/services/ticket.service.js');

      const mockProvider = {
        analyzeTicket: vi.fn(),
        summarizeTicket: vi.fn().mockResolvedValue({
          summary: 'Pre-reply Summary',
          mainProblem: 'Main problem before reply',
          currentState: 'OPEN',
          suggestedNextStep: 'Awaiting reply',
        }),
        generateDraftReply: vi.fn(),
      };

      const originalProvider = AiService.getProvider();
      AiService.setProvider(mockProvider);

      // 1. Generate initial summary
      await AiService.summarizeTicket(agent1TicketId, testAgent1);
      expect(mockProvider.summarizeTicket).toHaveBeenCalledTimes(1);

      // 2. Add an agent reply to the ticket
      await TicketService.addReply(agent1TicketId, 'Agent response answering customer', testAgent1);

      // 3. Update provider mock for the new summary
      mockProvider.summarizeTicket.mockResolvedValueOnce({
        summary: 'Updated Summary with Agent Reply',
        mainProblem: 'Main problem after reply',
        currentState: 'IN_PROGRESS',
        suggestedNextStep: 'Follow up',
      });

      // 4. Next summarize call re-executes because cache was invalidated by the new reply
      const updatedSummary = await AiService.summarizeTicket(agent1TicketId, testAgent1);
      expect(mockProvider.summarizeTicket).toHaveBeenCalledTimes(2);
      expect(updatedSummary.summary).toBe('Updated Summary with Agent Reply');

      AiService.setProvider(originalProvider);
    });
  });

  describe('7. Prompt Safety, Untrusted Delimiters & Secret Exclusion', () => {
    it('ensures context sent to AI provider contains strictly authorized ticket context and excludes secrets', async () => {
      const { AiService } = await import('../src/modules/ai/ai.service.js');
      let capturedContext: any = null;

      const inspectingProvider = {
        analyzeTicket: vi.fn().mockImplementation(async (context) => {
          capturedContext = context;
          return {
            category: 'SECURITY',
            suggestedPriority: 'HIGH',
            sentiment: 'NEUTRAL',
            reason: 'Inspected context safely',
          };
        }),
        summarizeTicket: vi.fn(),
        generateDraftReply: vi.fn(),
      };

      const originalProvider = AiService.getProvider();
      AiService.setProvider(inspectingProvider);

      await AiService.analyzeTicket(agent1TicketId, testAgent1, true);

      expect(capturedContext).toBeDefined();
      expect(capturedContext.ticketId).toBe(agent1TicketId);
      expect(capturedContext.customerName).toBe('Alice Cooper');

      // Verify no passwords, tokens, hashes, or env variables exist in context
      expect(capturedContext).not.toHaveProperty('password');
      expect(capturedContext).not.toHaveProperty('passwordHash');
      expect(capturedContext).not.toHaveProperty('jwt');
      expect(capturedContext).not.toHaveProperty('token');
      expect(capturedContext).not.toHaveProperty('GEMINI_API_KEY');
      expect(capturedContext).not.toHaveProperty('MONGODB_URI');

      AiService.setProvider(originalProvider);
    });
  });
});



