import jwt from "jsonwebtoken";
import ErrorCode from "../../common/enums/errorCode.enum";
import { VerificationEnum } from "../../common/enums/verificationCode.enum";
import {
  LoginDataType,
  RegisterDataType,
} from "../../common/interface/auth.interface";
import { BadRequestException } from "../../common/utils/catchError";
import { fortyFiveMinutesFromNow } from "../../common/utils/dateTime";
import SessionModel from "../../database/models/session.model";
import userModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { config } from "../../config/app.config";

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

  public async login(loginData: LoginDataType) {
    const { email, password, userAgent } = loginData;
    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    // Check if the user enable 2FA return user == null

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.JWT.SECRET,
      {
        audience: ["user"],
        expiresIn: config.JWT.EXPIRES_IN,
      }
    );

    const refreshToken = jwt.sign(
      { sessionId: session._id },
      config.JWT.REFRESH_SECRET,
      {
        audience: ["user"],
        expiresIn: config.JWT.REFRESH_EXPIRES_IN,
      }
    );

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }
}
