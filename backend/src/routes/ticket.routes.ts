import { Router, Request, Response } from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTicketSchema,
  createInternalTicketSchema,
  publicStatusCheckSchema,
  ticketQuerySchema,
  ticketIdParamSchema,
  addReplySchema,
  updateStatusSchema,
  reassignTicketSchema,
} from '../schemas/ticket.schema.js';
import {
  publicTicketCreateLimiter,
  publicStatusCheckLimiter,
} from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ApiResponse } from '../utils/apiResponse.js';

// 1. Public Ticket Router
const publicRouter = Router();

publicRouter.post(
  '/tickets',
  publicTicketCreateLimiter,
  upload.array('attachments', 5),
  validate({ body: createTicketSchema }),
  asyncHandler(TicketController.createPublicTicket)
);

publicRouter.post(
  '/tickets/status',
  publicStatusCheckLimiter,
  validate({ body: publicStatusCheckSchema }),
  asyncHandler(TicketController.getPublicStatus)
);

// 2. Protected Ticket Router
const ticketRouter = Router();

ticketRouter.use(authenticate);

ticketRouter.get(
  '/',
  validate({ query: ticketQuerySchema }),
  asyncHandler(TicketController.getTickets)
);

ticketRouter.post(
  '/',
  upload.array('attachments', 5),
  validate({ body: createInternalTicketSchema }),
  asyncHandler(TicketController.createInternalTicket)
);

ticketRouter.get(
  '/:ticketId',
  validate({ params: ticketIdParamSchema }),
  asyncHandler(TicketController.getTicketById)
);

ticketRouter.get(
  '/:ticketId/timeline',
  validate({ params: ticketIdParamSchema }),
  asyncHandler(TicketController.getTimeline)
);

ticketRouter.post(
  '/:ticketId/replies',
  upload.array('attachments', 5),
  validate({ params: ticketIdParamSchema, body: addReplySchema }),
  asyncHandler(TicketController.addReply)
);

ticketRouter.patch(
  '/:ticketId/status',
  validate({ params: ticketIdParamSchema, body: updateStatusSchema }),
  asyncHandler(TicketController.updateStatus)
);

// Admin-only ticket reassignment
ticketRouter.patch(
  '/:ticketId/assignee',
  authorize('ADMIN'),
  validate({ params: ticketIdParamSchema, body: reassignTicketSchema }),
  asyncHandler(TicketController.reassignTicket)
);

// AI: Smart Ticket Analysis
ticketRouter.post(
  '/:ticketId/ai/analyze',
  validate({ params: ticketIdParamSchema }),
  asyncHandler(TicketController.analyzeTicket)
);

// AI: Ticket Summary
ticketRouter.post(
  '/:ticketId/ai/summarize',
  validate({ params: ticketIdParamSchema }),
  asyncHandler(TicketController.summarizeTicket)
);

// AI: Draft Reply
ticketRouter.post(
  '/:ticketId/ai/draft',
  validate({ params: ticketIdParamSchema }),
  asyncHandler(TicketController.generateAiDraft)
);

export { publicRouter as publicTicketRoutes, ticketRouter as ticketRoutes };

