import { UserModel } from '../models/user.model.js';
import { UserResponseDto } from '../types/user.types.js';
import { UserView } from '../views/user.view.js';

export class UserService {
  static async getAgents(): Promise<UserResponseDto[]> {
    const users = await UserModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return UserView.renderUserList(users);
  }
}
