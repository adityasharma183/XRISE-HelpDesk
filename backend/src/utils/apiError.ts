/**
 * API Error Class
 *
 * A custom error hierarchy for the helpdesk API. Every expected error condition
 * (bad input, auth failures, missing resources, rate limits) is represented as
 * a typed ApiError, letting the central error handler format consistent JSON responses.
 *
 * Usage:
 *   throw ApiError.unauthorized('Session expired');
 *   throw ApiError.ticketNotFound('XR-ABC123 does not exist');
 *
 * The `isOperational` flag distinguishes expected errors (bad credentials, missing
 * tickets) from unexpected crashes — only non-operational errors trigger alerts.
 */

/** All recognized API error codes used in JSON error responses */
export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'TICKET_NOT_FOUND'
  | 'AGENT_NOT_FOUND'
  | 'USER_INACTIVE'
  | 'RATE_LIMITED'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Ensures `instanceof ApiError` works correctly with TypeScript class inheritance
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory Methods ──────────────────────────────────────────────────
  // Convenience helpers that set the correct HTTP status code automatically.

  /** 400 — Client sent invalid or malformed data */
  static badRequest(message = 'Invalid request', code: ErrorCode = 'VALIDATION_ERROR', details?: unknown) {
    return new ApiError(400, code, message, details);
  }

  /** 401 — Missing or invalid authentication credentials */
  static unauthorized(message = 'Authentication required', code: ErrorCode = 'AUTH_REQUIRED') {
    return new ApiError(401, code, message);
  }

  /** 403 — Authenticated but insufficient permissions */
  static forbidden(message = 'You do not have permission to perform this action', code: ErrorCode = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  /** 404 — Generic resource not found */
  static notFound(message = 'Resource not found', code: ErrorCode = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  /** 404 — Ticket-specific not found (uses distinct error code for client handling) */
  static ticketNotFound(message = 'Ticket not found') {
    return new ApiError(404, 'TICKET_NOT_FOUND', message);
  }

  /** 404 — Agent-specific not found (e.g., during reassignment) */
  static agentNotFound(message = 'Agent not found') {
    return new ApiError(404, 'AGENT_NOT_FOUND', message);
  }

  /** 429 — Rate limit exceeded */
  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  /** 500 — Unexpected server error (isOperational = false triggers alerting) */
  static internal(message = 'Internal server error', details?: unknown) {
    return new ApiError(500, 'INTERNAL_ERROR', message, details, false);
  }
}
