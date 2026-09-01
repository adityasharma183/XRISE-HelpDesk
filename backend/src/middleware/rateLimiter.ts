/**
 * Rate Limiting Middleware
 *
 * Protects the API from abuse with tiered rate limits:
 *   - apiLimiter:               General API protection (100 req / 15 min)
 *   - authLimiter:              Brute-force login protection (15 req / 15 min)
 *   - publicTicketCreateLimiter: Spam prevention for ticket creation (10 req / 15 min)
 *   - publicStatusCheckLimiter:  Ticket enumeration protection (30 req / 15 min)
 *
 * All limiters are disabled during test runs to avoid flaky tests.
 * Exceeding the limit returns a 429 Too Many Requests error via ApiError.
 */

import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

/** Creates a consistent error handler for all rate limiters */
const standardErrorResponse = (message: string) => {
  return (req: any, res: any, next: any) => {
    next(ApiError.tooManyRequests(message));
  };
};

/** General API rate limiter — applied globally to /api/* */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable legacy `X-RateLimit-*` headers
  handler: standardErrorResponse('Too many requests from this IP, please try again later.'),
  skip: () => env.NODE_ENV === 'test',
});

/** Stricter limiter for login endpoint — prevents brute-force attacks */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardErrorResponse('Too many login attempts. Please try again after 15 minutes.'),
  skip: () => env.NODE_ENV === 'test',
});

/** Prevents spam ticket creation from the public portal */
export const publicTicketCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardErrorResponse('Ticket creation limit reached. Please wait before submitting more tickets.'),
  skip: () => env.NODE_ENV === 'test',
});

/** Limits ticket status lookups to prevent ticket ID enumeration */
export const publicStatusCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardErrorResponse('Too many status checks. Please wait a moment before trying again.'),
  skip: () => env.NODE_ENV === 'test',
});
