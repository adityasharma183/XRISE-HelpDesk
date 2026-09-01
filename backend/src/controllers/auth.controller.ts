import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthView } from '../views/auth.view.js';
import { env } from '../config/env.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { token, user } = await AuthService.login(email, password);

    // Set secure HttpOnly cookie
    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return ApiResponse.success(res, AuthView.renderAuthResponse(user, token));
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie(env.COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return ApiResponse.success(res, AuthView.renderLogoutResponse());
  }

  static async getMe(req: Request, res: Response) {
    const user = await AuthService.getCurrentUser(req.user!._id.toString());
    return ApiResponse.success(res, { user });
  }
}
