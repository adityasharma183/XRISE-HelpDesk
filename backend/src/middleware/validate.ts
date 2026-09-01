/**
 * Request Validation Middleware (Zod)
 *
 * Validates incoming request data (body, query, params) against Zod schemas
 * before the request reaches the controller. If validation fails, the error
 * is forwarded to the central error handler which formats it as a 400 response.
 *
 * Usage:
 *   router.post('/tickets', validate({ body: createTicketSchema }), handler);
 *   router.get('/tickets', validate({ query: ticketQuerySchema }), handler);
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/** Defines which parts of the request to validate */
export interface RequestValidators {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/**
 * Creates a middleware that parses and replaces req.body / req.query / req.params
 * with the validated (and potentially transformed) output from the Zod schema.
 */
export function validate(schemas: RequestValidators) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      // Forward validation errors to the central error handler
      next(error);
    }
  };
}
