/**
 * Central Error Handler
 *
 * The single place where all errors (thrown or forwarded via `next(err)`)
 * are caught and transformed into consistent JSON error responses.
 *
 * Error categories handled:
 *   1. ApiError     — Our own typed errors (auth, validation, not-found, etc.)
 *   2. ZodError     — Request validation failures from Zod schemas
 *   3. CastError    — Mongoose invalid ObjectId format
 *   4. ValidationError — Mongoose schema validation failure
 *   5. Everything else — Unexpected 500 errors (logged at error level)
 *
 * In development, unhandled errors include the error message for debugging.
 * In production, they return a generic message to avoid leaking internals.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // Express requires 4 parameters to recognize this as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const reqId = req.headers['x-request-id'] || 'unknown';

  // ── 1. Known ApiError — structured, expected errors ────────────────
  if (err instanceof ApiError) {
    logger.warn(
      {
        reqId,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
      },
      `API Error: ${err.message}`
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // ── 2. Zod Validation Error — request schema violations ────────────
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn(
      {
        reqId,
        code: 'VALIDATION_ERROR',
        details: formattedDetails,
        path: req.originalUrl,
        method: req.method,
      },
      'Validation Error'
    );

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: formattedDetails,
      },
    });
  }

  // ── 3. Mongoose CastError / ValidationError ────────────────────────
  if (err && typeof err === 'object' && 'name' in err) {
    const errorObj = err as { name: string; message: string };

    // Invalid ObjectId format (e.g., "not-a-valid-id" passed as a MongoDB ID)
    if (errorObj.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid identifier format',
        },
      });
    }

    // Mongoose schema validation failure (e.g., missing required field)
    if (errorObj.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Database validation failed',
        },
      });
    }
  }

  // ── 4. Unhandled / Unexpected Error — the catch-all ────────────────
  logger.error(
    {
      reqId,
      err,
      path: req.originalUrl,
      method: req.method,
    },
    'Unhandled Internal Server Error'
  );

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      // Only expose raw error message in development to aid debugging
      ...(env.NODE_ENV === 'development' && err instanceof Error
        ? { details: err.message }
        : {}),
    },
  });
}
