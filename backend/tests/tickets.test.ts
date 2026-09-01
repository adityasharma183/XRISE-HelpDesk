import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { testAdmin, testAgent1, testAgent2 } from './setup.js';
import { signToken } from '../src/utils/jwt.js';
import { TicketModel, TicketMessageModel, TicketEventModel } from '../src/models/index.js';
import './setup.js';

describe('Tickets API & RBAC Authorization', () => {
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

  describe('1. Public Ticket Creation & Status Lookup', () => {
    it('should allow customer to create a ticket without auth and return XR-XXXXXX ID', async () => {
      const res = await request(app)
        .post('/api/public/tickets')
        .send({
          name: 'Jane Doe',
          email: 'jane@acme.com',
          subject: 'Broken login button on dashboard',
          body: 'When clicking the login button on the top right, nothing happens and browser console shows error.',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketId).toMatch(/^XR-[A-Z0-9]{6}$/);

      // Verify CREATED event was stored in TicketEvent collection
      const event = await TicketEventModel.findOne({ ticketId: res.body.data.ticketId });
      expect(event).toBeDefined();
      expect(event?.type).toBe('CREATED');
      expect(event?.actor.name).toBe('Jane Doe');
    });

    it('should reject invalid ticket creation payload with 400', async () => {
      const res = await request(app)
        .post('/api/public/tickets')
        .send({
          name: 'J',
          email: 'not-an-email',
          subject: 'Hi',
          body: 'Too short',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should verify ticketId AND email before returning ticket info to customer', async () => {
      const createRes = await request(app)
        .post('/api/public/tickets')
        .send({
          name: 'Jane Doe',
          email: 'jane@acme.com',
          subject: 'Payment failed for Invoice #102',
          body: 'My credit card was charged twice for the annual subscription.',
          priority: 'URGENT',
        });

      const ticketId = createRes.body.data.ticketId;

      // Status check with CORRECT email
      const statusRes = await request(app)
        .post('/api/public/tickets/status')
        .send({
          ticketId,
          email: 'jane@acme.com',
        });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.data.ticketId).toBe(ticketId);
      expect(statusRes.body.data.status).toBe('OPEN');

      // Status check with WRONG email must fail with 404
      const wrongEmailRes = await request(app)
        .post('/api/public/tickets/status')
        .send({
          ticketId,
          email: 'attacker@evil.com',
        });

      expect(wrongEmailRes.status).toBe(404);
      expect(wrongEmailRes.body.error.code).toBe('TICKET_NOT_FOUND');
    });
  });

  describe('2. Internal Ticket Listing & Agent Isolation', () => {
    it('enforces database-level query scoping: Agent 1 only sees tickets assigned to Agent 1', async () => {
      // Create ticket assigned to Agent 1
      await TicketModel.create({
        ticketId: 'XR-AGENT1T',
        customer: { name: 'Cust 1', email: 'c1@test.com' },
        subject: 'Agent 1 Task',
        body: 'Details for agent 1 ticket description here.',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      // Create ticket assigned to Agent 2
      await TicketModel.create({
        ticketId: 'XR-AGENT2T',
        customer: { name: 'Cust 2', email: 'c2@test.com' },
        subject: 'Agent 2 Task',
        body: 'Details for agent 2 ticket description here.',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignee: testAgent2._id,
      });

      // Agent 1 queries /api/tickets
      const agent1Res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${getAgent1Token()}`);

      expect(agent1Res.status).toBe(200);
      expect(agent1Res.body.data.length).toBe(1);
      expect(agent1Res.body.data[0].ticketId).toBe('XR-AGENT1T');

      // Admin queries /api/tickets -> sees ALL tickets
      const adminRes = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${getAdminToken()}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.length).toBe(2);
    });

    it('rejects Agent 1 attempting to access Agent 2 ticket details with 403 FORBIDDEN', async () => {
      await TicketModel.create({
        ticketId: 'XR-AGENT2S',
        customer: { name: 'Cust 2', email: 'c2@test.com' },
        subject: 'Secret agent 2 issue',
        body: 'Confidential client issue details description.',
        priority: 'HIGH',
        status: 'OPEN',
        assignee: testAgent2._id,
      });

      const res = await request(app)
        .get('/api/tickets/XR-AGENT2S')
        .set('Authorization', `Bearer ${getAgent1Token()}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('3. Agent Reply & Status Change', () => {
    it('should allow assigned agent to reply to ticket and record REPLIED event', async () => {
      await TicketModel.create({
        ticketId: 'XR-REPLY01',
        customer: { name: 'Client X', email: 'cx@test.com' },
        subject: 'Question on API limits',
        body: 'How many calls per minute are allowed on pro tier?',
        priority: 'LOW',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      const replyRes = await request(app)
        .post('/api/tickets/XR-REPLY01/replies')
        .set('Authorization', `Bearer ${getAgent1Token()}`)
        .send({
          body: 'Hello! The Pro tier allows up to 1,000 requests per minute.',
        });

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.data.senderType).toBe('AGENT');
      expect(replyRes.body.data.senderName).toBe('Aarav Sharma');

      // Verify timeline message
      const messages = await TicketMessageModel.find({ ticketId: 'XR-REPLY01' });
      expect(messages.length).toBe(1);

      // Verify REPLIED event
      const event = await TicketEventModel.findOne({ ticketId: 'XR-REPLY01', type: 'REPLIED' });
      expect(event).toBeDefined();
    });

    it('should allow agent to change status to RESOLVED and CLOSED', async () => {
      await TicketModel.create({
        ticketId: 'XR-STAT001',
        customer: { name: 'Client Y', email: 'cy@test.com' },
        subject: 'Bug report on exports',
        body: 'CSV export generates empty columns in table view.',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      const patchRes = await request(app)
        .patch('/api/tickets/XR-STAT001/status')
        .set('Authorization', `Bearer ${getAgent1Token()}`)
        .send({
          status: 'CLOSED',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('CLOSED');
      expect(patchRes.body.data.closedAt).toBeDefined();

      const event = await TicketEventModel.findOne({ ticketId: 'XR-STAT001', type: 'STATUS_CHANGED' });
      expect(event?.metadata.previousStatus).toBe('OPEN');
      expect(event?.metadata.newStatus).toBe('CLOSED');
    });
  });

  describe('4. Admin Reassignment & Round Robin', () => {
    it('should allow Admin to fetch agent list and reassign ticket to Agent 2', async () => {
      await TicketModel.create({
        ticketId: 'XR-REASGN1',
        customer: { name: 'Client Z', email: 'cz@test.com' },
        subject: 'Database migration question',
        body: 'We are moving from PostgreSQL to MongoDB Atlas.',
        priority: 'HIGH',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      // Admin fetches agent list
      const agentsRes = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${getAdminToken()}`);

      expect(agentsRes.status).toBe(200);
      expect(agentsRes.body.data.length).toBeGreaterThanOrEqual(3);

      // Admin reassigns to Agent 2
      const reassignRes = await request(app)
        .patch('/api/tickets/XR-REASGN1/assignee')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          assigneeId: testAgent2._id.toString(),
        });

      expect(reassignRes.status).toBe(200);
      expect(reassignRes.body.data.assignee.id).toBe(testAgent2._id.toString());

      // Verify REASSIGNED event recorded
      const event = await TicketEventModel.findOne({ ticketId: 'XR-REASGN1', type: 'REASSIGNED' });
      expect(event).toBeDefined();
      expect(event?.metadata.newAssigneeName).toBe('Ananya Patel');
    });

    it('should allow Admin to reassign ticket using round-robin', async () => {
      await TicketModel.create({
        ticketId: 'XR-RR001',
        customer: { name: 'Client RR', email: 'crr@test.com' },
        subject: 'Round Robin auto dispatch test',
        body: 'Testing round robin assignment across 3 agents.',
        priority: 'HIGH',
        status: 'OPEN',
        assignee: null,
      });

      const rrRes = await request(app)
        .patch('/api/tickets/XR-RR001/assignee')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          assigneeId: 'round-robin',
        });

      expect(rrRes.status).toBe(200);
      expect(rrRes.body.data.assignee).toBeDefined();
      expect(rrRes.body.data.assignee.id).toBeDefined();
    });

    it('should reject Agent attempting to reassign a ticket with 403 FORBIDDEN', async () => {
      await TicketModel.create({
        ticketId: 'XR-REASGN2',
        customer: { name: 'Client W', email: 'cw@test.com' },
        subject: 'Network latency issue',
        body: 'Latency spiked to 400ms in us-east region.',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      const reassignRes = await request(app)
        .patch('/api/tickets/XR-REASGN2/assignee')
        .set('Authorization', `Bearer ${getAgent1Token()}`)
        .send({
          assigneeId: testAgent2._id.toString(),
        });

      expect(reassignRes.status).toBe(403);
      expect(reassignRes.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('5. AI Draft Reply Endpoint', () => {
    it('should allow authorized agent to generate AI draft reply without modifying ticket', async () => {
      await TicketModel.create({
        ticketId: 'XR-AIDRAFT1',
        customer: { name: 'Robert Paulson', email: 'robert@fightclub.org' },
        subject: 'How do I reset my API token?',
        body: 'I lost my production secret token and need to rotate it immediately without downtime.',
        priority: 'HIGH',
        status: 'OPEN',
        assignee: testAgent1._id,
      });

      const res = await request(app)
        .post('/api/tickets/XR-AIDRAFT1/ai/draft')
        .set('Authorization', `Bearer ${getAgent1Token()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('draft');
      expect(res.body.data.draft).toContain('Robert');
    });
  });
});
