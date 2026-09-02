/**
 * API Response Helpers
 *
 * Standardizes every outbound JSON response into a consistent envelope:
 *   { success: true, data: <payload> }
 *   { success: true, data: <payload>, pagination: { page, limit, total, totalPages } }
 *
 * This ensures the frontend never has to guess the response shape —
 * it can always rely on `success` and `data` fields.
 */

import { Response } from 'express';

/** Shape of the pagination metadata attached to list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Full response envelope type — used for TypeScript safety in controllers */
export interface ApiResponsePayload<T> {
  success: boolean;
  data?: T;
  pagination?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiResponse {
  /** Wraps data in a standard success envelope */
  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /** Wraps data + pagination metadata — used by list/search endpoints */
  static paginated<T>(
    res: Response,
    data: T,
    pagination: PaginationMeta,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination,
    });
  }
}
