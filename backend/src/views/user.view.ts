import { IUserDocument, UserResponseDto } from '../types/user.types.js';

export class UserView {
  static renderUser(user: any): UserResponseDto {
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    };
  }

  static renderUserList(users: any[]): UserResponseDto[] {
    return users.map((u) => this.renderUser(u));
  }
}
