import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function startServer() {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV, clientUrl: env.CLIENT_URL },
        `🚀 Mini Helpdesk Backend server running at http://localhost:${env.PORT}`
      );
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.fatal(
          `❌ Port ${env.PORT} is already in use (on macOS, port 5000 is used by AirPlay Receiver). Please set PORT=5001 in .env.`
        );
      } else {
        logger.fatal({ err }, 'Server listen error');
      }
      process.exit(1);
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received termination signal. Gracefully shutting down...');
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds if lingering
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
