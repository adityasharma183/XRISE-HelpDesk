import http from 'http';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { initSocketServer } from '../src/socket/index.js';
import { signToken } from '../src/utils/jwt.js';
import { TicketService } from '../src/services/ticket.service.js';
import { testAdmin, testAgent1, testAgent2 } from './setup.js';

describe('Real-Time Socket.IO Integration & Security', () => {
  let server: http.Server;
  let port: number;
  let adminToken: string;
  let agent1Token: string;
  let agent2Token: string;

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    initSocketServer(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as any;
        port = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  beforeEach(() => {
    if (testAdmin) {
      adminToken = signToken({
        sub: testAdmin._id.toString(),
        email: testAdmin.email,
        role: 'ADMIN',
        name: testAdmin.name,
      });
    }

    if (testAgent1) {
      agent1Token = signToken({
        sub: testAgent1._id.toString(),
        email: testAgent1.email,
        role: 'AGENT',
        name: testAgent1.name,
      });
    }

    if (testAgent2) {
      agent2Token = signToken({
        sub: testAgent2._id.toString(),
        email: testAgent2.email,
        role: 'AGENT',
        name: testAgent2.name,
      });
    }
  });

  it('1. should connect to Socket.IO server and authenticate with JWT token', async () => {
    const client: ClientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.disconnect();
        resolve();
      });
      client.on('connect_error', reject);
    });
  });

  it('2. should allow Admin to join any ticket room and dashboard room', async () => {
    const created = await TicketService.createPublicTicket({
      name: 'Test Customer',
      email: 'customer@example.com',
      subject: 'Login Issue',
      body: 'Cannot log in to my account',
      priority: 'HIGH',
    });

    const client: ClientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        client.emit('ticket:join', { ticketId: created.ticketId }, (res: any) => {
          expect(res.success).toBe(true);

          client.emit('dashboard:join', (dashRes: any) => {
            expect(dashRes.success).toBe(true);
            client.disconnect();
            resolve();
          });
        });
      });
      client.on('connect_error', reject);
    });
  });

  it('3. should block an Agent from joining an unassigned ticket room', async () => {
    // Ticket assigned to Agent 1
    const created = await TicketService.createInternalTicket(
      {
        name: 'Internal Customer',
        email: 'user@company.com',
        subject: 'Internal System Setup',
        body: 'Please configure workstation',
        priority: 'MEDIUM',
        assigneeId: testAgent1._id.toString(),
      },
      testAdmin
    );

    // Agent 2 attempts to join Agent 1's ticket room
    const agent2Client: ClientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token: agent2Token },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      agent2Client.on('connect', () => {
        agent2Client.emit('ticket:join', { ticketId: created.ticketId }, (res: any) => {
          expect(res.success).toBe(false);
          expect(res.error).toMatch(/unauthorized/i);
          agent2Client.disconnect();
          resolve();
        });
      });
      agent2Client.on('connect_error', reject);
    });
  });

  it('4. should allow public customer to join ticket room only with matching email', async () => {
    const created = await TicketService.createPublicTicket({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      subject: 'Billing Question',
      body: 'Need invoice copy',
      priority: 'LOW',
    });

    const publicClient: ClientSocket = ioClient(`http://localhost:${port}`, {
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      publicClient.on('connect', () => {
        // Attempt with wrong email
        publicClient.emit('ticket:join', { ticketId: created.ticketId, email: 'wrong@example.com' }, (res1: any) => {
          expect(res1.success).toBe(false);

          // Attempt with matching email
          publicClient.emit('ticket:join', { ticketId: created.ticketId, email: 'jane.doe@example.com' }, (res2: any) => {
            expect(res2.success).toBe(true);
            publicClient.disconnect();
            resolve();
          });
        });
      });
      publicClient.on('connect_error', reject);
    });
  });

  it('5. should broadcast status change and replies in real-time to joined room', async () => {
    const created = await TicketService.createPublicTicket({
      name: 'Broadcast Tester',
      email: 'tester@example.com',
      subject: 'Broadcast Live Test',
      body: 'Live ticket test',
      priority: 'URGENT',
    });

    const client: ClientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        client.emit('ticket:join', { ticketId: created.ticketId }, async (res: any) => {
          expect(res.success).toBe(true);

          let statusReceived = false;
          let replyReceived = false;

          client.on('ticket:status-changed', (payload: any) => {
            expect(payload.ticketId).toBe(created.ticketId);
            expect(payload.data.newStatus).toBe('IN_PROGRESS');
            statusReceived = true;
            if (statusReceived && replyReceived) {
              client.disconnect();
              resolve();
            }
          });

          client.on('ticket:reply-added', (payload: any) => {
            expect(payload.ticketId).toBe(created.ticketId);
            expect(payload.data.body).toBe('We are investigating this issue right now.');
            replyReceived = true;
            if (statusReceived && replyReceived) {
              client.disconnect();
              resolve();
            }
          });

          // Trigger status update via REST service
          await TicketService.updateStatus(created.ticketId, 'IN_PROGRESS', testAdmin);

          // Trigger reply via REST service
          await TicketService.addReply(created.ticketId, 'We are investigating this issue right now.', testAdmin);
        });
      });
      client.on('connect_error', reject);
    });
  });

  it('6. should allow leaving ticket room cleanly', async () => {
    const created = await TicketService.createPublicTicket({
      name: 'Leave Room User',
      email: 'leave@example.com',
      subject: 'Leave Room Test',
      body: 'Testing leave room',
      priority: 'LOW',
    });

    const client: ClientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        client.emit('ticket:join', { ticketId: created.ticketId }, (joinRes: any) => {
          expect(joinRes.success).toBe(true);

          client.emit('ticket:leave', { ticketId: created.ticketId }, (leaveRes: any) => {
            expect(leaveRes.success).toBe(true);
            client.disconnect();
            resolve();
          });
        });
      });
      client.on('connect_error', reject);
    });
  });
});
