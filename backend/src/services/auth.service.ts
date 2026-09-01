import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { signToken, JwtPayload } from '../utils/jwt.js';
import { logger } from '../config/logger.js';
import { UserResponseDto } from '../types/user.types.js';
import { UserView } from '../views/user.view.js';

export class AuthService {
  /**
   * Authenticates staff credentials (Admin or Support Agent),
   * verifies account active status, and issues a signed JWT token.
   */
  static async login(email: string, password: string): Promise<{ token: string; user: UserResponseDto }> {
    // 1. Look up user by email in database
    const user = await UserModel.findOne({ email });

    if (!user) {
      // Return generic message to prevent email enumeration
      logger.warn({ email }, 'Login failed: user not found');
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // 2. Guard against deactivated staff accounts
    if (!user.isActive) {
      logger.warn({ email, userId: user._id }, 'Login failed: user deactivated');
      throw new ApiError(403, 'USER_INACTIVE', 'This account has been deactivated. Please contact support.');
    }

    // 3. Verify bcrypt password hash against user input
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn({ email, userId: user._id }, 'Login failed: invalid password');
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // 4. Build JWT payload containing user claims and role
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = signToken(payload);

    logger.info({ userId: user._id, role: user.role }, 'User login successful');

    // 5. Transform user document to sanitized response DTO (omits sensitive password hashes)
    const userDto = UserView.renderUser(user);

    return { token, user: userDto };
  }

  /**
   * Retrieves current authenticated user details by decoded token ID.
   */
  static async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await UserModel.findById(userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    return UserView.renderUser(user);
  }
}
