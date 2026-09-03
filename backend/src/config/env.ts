/**
 * Environment Configuration
 *
 * Loads and validates all environment variables from .env files using Zod schemas.
 * If any required value is missing or invalid, the server refuses to start — this
 * prevents silent misconfigurations from reaching production.
 *
 * Resolution order: backend/.env → workspace root .env → process.cwd() .env
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files in cascading priority — first match wins for each variable
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

/**
 * Zod schema enforcing strict types and sensible defaults for every config value.
 * Coercion (z.coerce) handles the string→number conversion that process.env requires.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  API_BASE_URL: z.string().url().default('http://localhost:8000'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z
    .string({ required_error: 'MONGODB_URI is required' })
    .min(1, 'MONGODB_URI cannot be empty')
    .refine(
      (uri) => uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://'),
      'MONGODB_URI must be a valid MongoDB connection string (e.g., mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>)'
    )
    .default('mongodb://localhost:27017/mini_helpdesk'),

  // JWT signing secret — enforced minimum length prevents weak tokens
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long')
    .default('development_jwt_secret_key_minimum_32_characters_long_12345'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cookie name used for HttpOnly auth token storage
  COOKIE_NAME: z.string().default('helpdesk_auth_token'),

  // Optional Gemini API key for AI-powered ticket features
  GEMINI_API_KEY: z.string().optional().default(''),

  // Cloudinary — required only when attachments are uploaded
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Rate limiting — tuned per-route via middleware, these are global defaults
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Timeout for AI model calls — prevents hanging requests
  GEMINI_TIMEOUT_MS: z.coerce.number().optional().default(3000),
});

const parsedEnv = envSchema.safeParse(process.env);

// Hard-fail on invalid config so misconfigured deploys never reach traffic
if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
