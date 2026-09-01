import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

export class HealthController {
  static getHealth(req: Request, res: Response) {
    const isDbConnected = mongoose.connection.readyState === 1;

    return ApiResponse.success(res, {
      status: 'ok',
      service: 'mini-helpdesk-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDbConnected ? 'connected' : 'disconnected',
    });
  }
}
