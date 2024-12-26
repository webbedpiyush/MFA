import jwt from "jsonwebtoken";
import ErrorCode from "../../common/enums/errorCode.enum";
import { VerificationEnum } from "../../common/enums/verificationCode.enum";
import {
  LoginDataType,
  RegisterDataType,
} from "../../common/interface/auth.interface";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catchError";
import {
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
} from "../../common/utils/dateTime";
import SessionModel from "../../database/models/session.model";
import userModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { config } from "../../config/app.config";
import {
  RefreshTokenPayload,
  RefreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
} from "../../common/utils/jwt";
import { sendEmail } from "../../mailers/mailer";
import { verifyEmailTemplate } from "../../mailers/templates/template";

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

    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    const verificatonUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
    // Sending verification email link TODO!
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificatonUrl),
    });

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

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });

    // jwt.sign({ userId: user._id, sessionId: session._id }, config.JWT.SECRET, {
    //   audience: ["user"],
    //   expiresIn: config.JWT.EXPIRES_IN,
    // });

    const refreshToken = signJwtToken(
      { sessionId: session._id },
      RefreshTokenSignOptions
    );

    // jwt.sign({ sessionId: session._id }, config.JWT.REFRESH_SECRET, {
    //   audience: ["user"],
    //   expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    // });

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTokenPayload>(refreshToken, {
      secret: RefreshTokenSignOptions.secret,
    });
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequiredRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequiredRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN
      );
      await session.save();
    }

    const newRefreshToken = sessionRequiredRefresh
      ? signJwtToken(
          {
            sessionId: session._id,
          },
          RefreshTokenSignOptions
        )
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string) {
    const validCode = await VerificationCodeModel.findOne({
      code,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification");
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VERIFICATION_ERROR
      );
    }
    await validCode.deleteOne();

    return {
      user: updatedUser,
    };
  }
}
