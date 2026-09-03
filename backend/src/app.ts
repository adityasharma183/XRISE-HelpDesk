import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { nanoid } from 'nanoid';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export function createApp() {
  const app = express();

  // Security Headers (relaxed CSP to ensure Swagger UI assets and scripts render cleanly)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // Strict CORS Policy
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Request Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Favicon handler
  app.get('/favicon.ico', (_req, res) => res.status(204).end());

  // Root welcome endpoint for direct browser visits
  app.get('/', (_req, res) => {
    res.json({
      name: 'XRISEAI Mini Helpdesk API',
      status: 'online',
      version: '1.0.0',
      frontendUrl: env.CLIENT_URL,
      healthCheck: '/api/health',
      docs: '/api-docs',
      endpoints: {
        publicTickets: '/api/public/tickets',
        publicStatus: '/api/public/tickets/status',
        auth: '/api/auth',
        tickets: '/api/tickets',
      },
    });
  });

  // Swagger UI & OpenAPI Specification (Available in all environments)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // Structured HTTP Request Logging with correlation ID
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req.headers['x-request-id'] as string) || nanoid(10),
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      autoLogging: {
        ignore: (req) =>
          req.url === '/api/health' ||
          req.url === '/favicon.ico' ||
          req.url?.startsWith('/api-docs') ||
          env.NODE_ENV === 'test',
      },
    })
  );

  // Global Rate Limiter for /api
  app.use('/api', apiLimiter);

  // API Routes
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
