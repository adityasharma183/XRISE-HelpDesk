import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class UserController {
  static async getAgents(req: Request, res: Response) {
    const agents = await UserService.getAgents();
    return ApiResponse.success(res, agents);
  }
}
