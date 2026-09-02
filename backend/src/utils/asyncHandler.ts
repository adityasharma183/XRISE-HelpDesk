/**
 * Async Route Handler Wrapper
 *
 * Express doesn't natively catch errors thrown inside async route handlers —
 * unhandled rejections would crash the process. This wrapper ensures any
 * thrown error (including async ones) is forwarded to Express's error handler
 * via next(), so we never need try/catch boilerplate in individual controllers.
 *
 * Usage:
 *   router.get('/tickets', asyncHandler(TicketController.getTickets));
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
