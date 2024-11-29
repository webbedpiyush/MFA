import ErrorCode from "../../common/enums/errorCode.enum";
import { VerificationEnum } from "../../common/enums/verificationCode.enum";
import { RegisterDataType } from "../../common/interface/auth.interface";
import { BadRequestException } from "../../common/utils/catchError";
import { fortyFiveMinutesFromNow } from "../../common/utils/dateTime";
import userModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";

export class AuthService {
  public async register(registerData: RegisterDataType) {
    const { name, email, password } = registerData;

    const existingUser = await userModel.exists({
      email,
    });
    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await userModel.create({
      name,
      password,
      email,
    });

    const userId = newUser._id;

    const verificationCode = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link TODO!

    return {
      user: newUser,
    };
  }
}
