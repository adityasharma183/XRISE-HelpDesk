/**
 * 404 Not Found Handler
 *
 * Catches any request that doesn't match a defined route and forwards
 * a descriptive ApiError to the central error handler.
 * Must be registered AFTER all route definitions in the Express middleware chain.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
}
