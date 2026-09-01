/**
 * MongoDB Connection Manager
 *
 * Handles the lifecycle of the Mongoose connection — connecting at startup
 * and gracefully disconnecting during shutdown or test teardown.
 */

import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Opens a MongoDB connection using the configured URI.
 * Accepts an optional override URI for testing with in-memory databases.
 */
export async function connectDatabase(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(uri);
    logger.info({ host: conn.connection.host }, `MongoDB connected to ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    logger.fatal({ err: error }, `Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Closes all Mongoose connections — called during graceful shutdown
 * and after test suites complete.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
