import { UserResponseDto } from '../types/user.types.js';

export class AuthView {
  static renderAuthResponse(user: UserResponseDto, token: string) {
    return {
      user,
      token,
    };
  }

  static renderLogoutResponse() {
    return {
      message: 'Logged out successfully',
    };
  }
}
