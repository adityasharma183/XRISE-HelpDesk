/**
 * Structured Logger (Pino)
 *
 * Provides a structured JSON logger for the entire backend.
 * - Development: Uses pino-pretty for human-readable console output.
 * - Production:  Outputs raw JSON for log aggregation (e.g., Datadog, ELK).
 * - Test:        Silenced to keep test output clean.
 *
 * Sensitive fields (passwords, tokens, API keys) are automatically redacted
 * to prevent accidental exposure in logs.
 */

import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  // Adjust verbosity per environment — debug in dev, silent in tests
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Pretty-print only in development for readable console output
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,

  // Automatically scrub sensitive data from all log entries
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'jwt',
      'GEMINI_API_KEY',
    ],
    censor: '[REDACTED]',
  },
});
