/**
 * JWT Token Utilities
 *
 * Signs and verifies JSON Web Tokens for staff authentication.
 * Tokens carry the user's ID, email, role, and name — enough for
 * the auth middleware to authorize requests without a database query
 * on every single API call (the DB lookup only happens to confirm
 * the user still exists and is active).
 */

import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Claims embedded in every issued JWT */
export interface JwtPayload {
  sub: string;    // MongoDB user ID
  email: string;  // Staff email address
  role: 'AGENT' | 'ADMIN';
  name: string;   // Display name
}

/** Signs a new JWT with the configured secret and expiration */
export function signToken(payload: JwtPayload, options?: SignOptions): string {
  const signOpts: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    ...options,
  };
  return jwt.sign(payload, env.JWT_SECRET, signOpts);
}

/** Verifies and decodes a JWT — throws if expired or tampered */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
