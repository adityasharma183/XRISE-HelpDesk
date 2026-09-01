import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { UserModel, TicketModel, TicketMessageModel, TicketEventModel } from '../models/index.js';
import { logger } from '../config/logger.js';

export async function seedDatabase() {
  await connectDatabase();
  logger.info('🌱 Starting database seeding...');

  // Use 12 salt rounds for secure bcrypt password hashing
  const saltRounds = 12;

  // 1. Seed Staff Users
  // Using idempotent findOneAndUpdate with upsert: true ensures we never create duplicate accounts
  // and safely update credentials if modified in code.
  const usersToSeed = [
    {
      name: 'System Admin',
      email: 'admin@xriseai.com',
      password: 'admin@123',
      role: 'ADMIN' as const,
      isActive: true,
    },
    {
      name: 'Aarav Sharma',
      email: 'agent1@xriseai.com',
      password: 'agent1@123',
      role: 'AGENT' as const,
      isActive: true,
    },
    {
      name: 'Ananya Patel',
      email: 'agent2@xriseai.com',
      password: 'agent2@123',
      role: 'AGENT' as const,
      isActive: true,
    },
    {
      name: 'Rohan Verma',
      email: 'agent3@xriseai.com',
      password: 'agent3@123',
      role: 'AGENT' as const,
      isActive: true,
    },
  ];

  const seededUsers: Record<string, any> = {};

  for (const userData of usersToSeed) {
    // Generate secure password hash — plain passwords are never stored in MongoDB
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    const user = await UserModel.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          name: userData.name,
          email: userData.email,
          passwordHash,
          role: userData.role,
          isActive: userData.isActive,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededUsers[userData.email] = user;
    logger.info({ email: user.email, role: user.role, name: user.name }, `User seeded: ${user.email} (${user.name})`);
  }

  // 2. Check if tickets already exist to preserve idempotency
  const existingTicketCount = await TicketModel.countDocuments();
  if (existingTicketCount > 0) {
    logger.info(`Database already has ${existingTicketCount} tickets. Skipping demo ticket generation.`);
    return;
  }

  // 3. Seed Demo Tickets
  const demoTickets = [
    {
      ticketId: 'XR-9A2K4B',
      customer: {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      },
      subject: 'Unable to connect custom domain to workspace',
      body: 'Hi Support Team, I added the CNAME record for support.acme.org over 24 hours ago, but SSL provisioning still fails with error code 526. Could you please check the DNS status on your end?',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      assignee: seededUsers['agent1@xriseai.com']._id,
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      ticketId: 'XR-3M8V1P',
      customer: {
        name: 'David Miller',
        email: 'david.miller@enterprise.io',
      },
      subject: 'Urgent: Webhook payloads timing out during peak load',
      body: 'Our server received repeated 504 gateway timeouts when processing incoming event batch 9821. We have attached the failure trace. Please advise on webhook retry backoff policy.',
      priority: 'URGENT' as const,
      status: 'OPEN' as const,
      assignee: seededUsers['agent2@xriseai.com']._id,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      ticketId: 'XR-7X4W9Q',
      customer: {
        name: 'Elena Rostova',
        email: 'elena.rostova@techflow.co',
      },
      subject: 'Inquiry regarding SSO / SAML 2.0 integration with Okta',
      body: 'Hello, we are evaluating the enterprise plan and would like to configure Okta SSO. Where can we find the ACS URL and Entity ID for our tenant?',
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
      assignee: seededUsers['agent3@xriseai.com']._id,
      createdAt: new Date(Date.now() - 3600000 * 8),
    },
    {
      ticketId: 'XR-5H1L8Z',
      customer: {
        name: 'Marcus Vance',
        email: 'marcus.v@innovate.net',
      },
      subject: 'Billing inquiry: Invoice duplicate charge for May',
      body: 'We noticed two separate charges on May 1st for Invoice #INV-2026-05. Please refund the redundant transaction.',
      priority: 'LOW' as const,
      status: 'RESOLVED' as const,
      assignee: seededUsers['agent1@xriseai.com']._id,
      createdAt: new Date(Date.now() - 3600000 * 48),
      closedAt: new Date(Date.now() - 3600000 * 12),
    },
  ];

  for (const t of demoTickets) {
    const ticket = await TicketModel.create(t);

    // Initial Message
    await TicketMessageModel.create({
      ticketId: ticket.ticketId,
      senderType: 'CUSTOMER',
      senderName: ticket.customer.name,
      body: ticket.body,
      createdAt: ticket.createdAt,
    });

    // CREATED Event
    await TicketEventModel.create({
      ticketId: ticket.ticketId,
      type: 'CREATED',
      actor: {
        name: ticket.customer.name,
        role: 'CUSTOMER',
      },
      metadata: {
        priority: ticket.priority,
        subject: ticket.subject,
      },
      createdAt: ticket.createdAt,
    });

    // ASSIGNED Event
    if (ticket.assignee) {
      const assignedUser = Object.values(seededUsers).find(
        (u: any) => u._id.toString() === ticket.assignee?.toString()
      );

      await TicketEventModel.create({
        ticketId: ticket.ticketId,
        type: 'ASSIGNED',
        actor: {
          id: seededUsers['admin@xriseai.com']._id,
          name: seededUsers['admin@xriseai.com'].name,
          role: 'ADMIN',
        },
        metadata: {
          assigneeId: assignedUser?._id,
          assigneeName: assignedUser?.name,
          method: 'ROUND_ROBIN',
        },
        createdAt: new Date(ticket.createdAt.getTime() + 1800000),
      });
    }

    // Add Reply & Resolution for XR-9A2K4B and XR-5H1L8Z
    if (ticket.ticketId === 'XR-9A2K4B') {
      const replyTime = new Date(ticket.createdAt.getTime() + 3600000);
      await TicketMessageModel.create({
        ticketId: ticket.ticketId,
        senderType: 'AGENT',
        senderId: seededUsers['agent1@xriseai.com']._id,
        senderName: seededUsers['agent1@xriseai.com'].name,
        body: 'Hi Alice, thanks for reaching out! We verified your DNS records. Cloudflare requires an updated TXT verification record which has just been triggered. Could you re-verify in 15 minutes?',
        createdAt: replyTime,
      });

      await TicketEventModel.create({
        ticketId: ticket.ticketId,
        type: 'REPLIED',
        actor: {
          id: seededUsers['agent1@xriseai.com']._id,
          name: seededUsers['agent1@xriseai.com'].name,
          role: 'AGENT',
        },
        metadata: {},
        createdAt: replyTime,
      });

      await TicketEventModel.create({
        ticketId: ticket.ticketId,
        type: 'STATUS_CHANGED',
        actor: {
          id: seededUsers['agent1@xriseai.com']._id,
          name: seededUsers['agent1@xriseai.com'].name,
          role: 'AGENT',
        },
        metadata: {
          previousStatus: 'OPEN',
          newStatus: 'IN_PROGRESS',
        },
        createdAt: replyTime,
      });
    }

    if (ticket.ticketId === 'XR-5H1L8Z') {
      const replyTime = new Date(ticket.createdAt.getTime() + 3600000 * 20);
      await TicketMessageModel.create({
        ticketId: ticket.ticketId,
        senderType: 'AGENT',
        senderId: seededUsers['agent2@xriseai.com']._id,
        senderName: seededUsers['agent2@xriseai.com'].name,
        body: 'Hello Marcus, we verified the duplicate charge and issued a full refund for the secondary transaction. It will reflect on your card in 2-3 business days.',
        createdAt: replyTime,
      });

      await TicketEventModel.create({
        ticketId: ticket.ticketId,
        type: 'STATUS_CHANGED',
        actor: {
          id: seededUsers['agent2@xriseai.com']._id,
          name: seededUsers['agent2@xriseai.com'].name,
          role: 'AGENT',
        },
        metadata: {
          previousStatus: 'OPEN',
          newStatus: 'RESOLVED',
        },
        createdAt: replyTime,
      });
    }
  }

  logger.info('✅ Database seeded successfully!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ err }, 'Failed to seed database');
      await disconnectDatabase();
      process.exit(1);
    });
}
