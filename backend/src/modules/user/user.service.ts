import userModel from "../../database/models/user.model";

export class UserService {
  public async findUserById(userId: string) {
    const user = await userModel.findById(userId, {
      password: false,
    });
    return user || null;
  }
}
