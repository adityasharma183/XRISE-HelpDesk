import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cookie from 'cookie';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { TicketRepository } from '../repositories/ticket.repository.js';
import { UserModel } from '../models/user.model.js';
import { socketEmitter } from './socketEmitter.js';
import { SocketUser } from './socketTypes.js';

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:8000',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Allow in non-production or if matching base domain
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware for incoming socket handshakes
  io.use(async (socket: Socket, next) => {
    try {
      let token: string | null = null;

      // 1. Check handshake auth payload
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // 2. Check Authorization header
      if (!token && socket.handshake.headers.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1] || null;
        }
      }

      // 3. Check Cookie header
      if (!token && socket.handshake.headers.cookie) {
        const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        if (parsedCookies[env.COOKIE_NAME]) {
          token = parsedCookies[env.COOKIE_NAME] || null;
        }
      }

      if (token) {
        try {
          const payload: JwtPayload = verifyToken(token);
          const user = await UserModel.findById(payload.sub).lean().exec();

          if (user && user.isActive) {
            socket.data.user = {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            } as SocketUser;
            logger.debug({ userId: user._id, role: user.role }, 'Socket authenticated successfully');
          } else {
            socket.data.user = null;
          }
        } catch {
          // Token expired or invalid - treat as anonymous client
          socket.data.user = null;
        }
      } else {
        socket.data.user = null;
      }

      next();
    } catch (err) {
      logger.error({ err }, 'Error in socket authentication middleware');
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: SocketUser | null = socket.data.user;
    logger.info(
      { socketId: socket.id, user: user ? `${user.email} (${user.role})` : 'Anonymous' },
      'Socket client connected'
    );

    // 1. Join Ticket Room (with strict authorization checks)
    socket.on(
      'ticket:join',
      async (
        payload: { ticketId: string; email?: string },
        callback?: (res: { success: boolean; error?: string }) => void
      ) => {
        try {
          const { ticketId, email } = payload || {};
          if (!ticketId) {
            callback?.({ success: false, error: 'ticketId is required' });
            return;
          }

          // Case A: Administrator - can join any ticket room
          if (user?.role === 'ADMIN') {
            await socket.join(`ticket:${ticketId}`);
            logger.debug({ socketId: socket.id, ticketId, role: 'ADMIN' }, 'Admin joined ticket room');
            callback?.({ success: true });
            return;
          }

          // Case B: Agent - can join only if ticket is assigned to them
          if (user?.role === 'AGENT') {
            const ticket = await TicketRepository.findByTicketId(ticketId);
            if (!ticket) {
              callback?.({ success: false, error: 'Ticket not found' });
              return;
            }

            const assigneeId = (ticket.assignee as any)?._id?.toString() || ticket.assignee?.toString();
            if (assigneeId === user.id) {
              await socket.join(`ticket:${ticketId}`);
              logger.debug({ socketId: socket.id, ticketId, agentId: user.id }, 'Agent joined assigned ticket room');
              callback?.({ success: true });
            } else {
              logger.warn({ socketId: socket.id, ticketId, agentId: user.id }, 'Agent forbidden from joining unassigned ticket room');
              callback?.({ success: false, error: 'Unauthorized to access this ticket' });
            }
            return;
          }

          // Case C: Public Customer - requires matching ticketId + email verification
          if (!email) {
            callback?.({ success: false, error: 'Email is required for public ticket tracking' });
            return;
          }

          const ticket = await TicketRepository.findByTicketIdAndEmail(ticketId, email);
          if (ticket) {
            await socket.join(`ticket:${ticketId}`);
            logger.debug({ socketId: socket.id, ticketId, email }, 'Customer joined public ticket room');
            callback?.({ success: true });
          } else {
            logger.warn({ socketId: socket.id, ticketId, email }, 'Customer forbidden: Invalid ticket or email');
            callback?.({ success: false, error: 'Invalid ticket ID or email for verification' });
          }
        } catch (error: any) {
          logger.error({ error, socketId: socket.id }, 'Error handling ticket:join');
          callback?.({ success: false, error: 'Internal error joining ticket room' });
        }
      }
    );

    // 2. Leave Ticket Room
    socket.on(
      'ticket:leave',
      async (
        payload: { ticketId: string },
        callback?: (res: { success: boolean }) => void
      ) => {
        try {
          if (payload?.ticketId) {
            await socket.leave(`ticket:${payload.ticketId}`);
            logger.debug({ socketId: socket.id, ticketId: payload.ticketId }, 'Socket left ticket room');
          }
          callback?.({ success: true });
        } catch (error) {
          logger.error({ error, socketId: socket.id }, 'Error handling ticket:leave');
          callback?.({ success: false });
        }
      }
    );

    // 3. Join Dashboard Room (Staff only)
    socket.on(
      'dashboard:join',
      async (callback?: (res: { success: boolean; error?: string }) => void) => {
        if (user && (user.role === 'ADMIN' || user.role === 'AGENT')) {
          await socket.join('agent:dashboard');
          logger.debug({ socketId: socket.id, userId: user.id, role: user.role }, 'Staff joined dashboard room');
          callback?.({ success: true });
        } else {
          callback?.({ success: false, error: 'Unauthorized: Staff authentication required' });
        }
      }
    );

    // 4. Leave Dashboard Room
    socket.on(
      'dashboard:leave',
      async (callback?: (res: { success: boolean }) => void) => {
        await socket.leave('agent:dashboard');
        callback?.({ success: true });
      }
    );

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Socket client disconnected');
    });
  });

  // Initialize the singleton emitter with the Socket.IO instance
  socketEmitter.init(io);

  return io;
}
