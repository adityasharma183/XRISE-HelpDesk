/**
 * Authentication Middleware
 *
 * Extracts and verifies the JWT from either an HttpOnly cookie (preferred)
 * or an Authorization Bearer header (fallback for API clients / Postman).
 * After token verification, it fetches the full user document from MongoDB
 * and attaches it to `req.user` for downstream route handlers.
 *
 * Security notes:
 *   - Cookie-based auth is preferred because HttpOnly cookies are immune to XSS
 *   - Deactivated users are rejected even if their token is still valid
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { UserModel } from '../models/user.model.js';
import { env } from '../config/env.js';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Prefer HttpOnly cookie — the most secure transport for browser sessions
    if (req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }
    // 2. Fallback to Authorization Bearer header for API clients (Postman, curl, etc.)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    // Decode and verify token signature + expiration
    let payload: JwtPayload;
    try {
      payload = verifyToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired authentication token.');
    }

    // Confirm the user still exists in the database (handles deleted accounts)
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw ApiError.unauthorized('User account no longer exists.');
    }

    // Reject deactivated users even if their token hasn't expired yet
    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Contact an administrator.');
    }

    // Attach the full user document for use in controllers and services
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
