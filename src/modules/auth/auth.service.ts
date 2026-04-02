import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { SignUpRequestDto } from './dto/request/sign-up.dto';
import { ConfirmAccountRequestDto } from './dto/request/confirm-account.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.dto';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { LoginMethod, User, UserStatus } from '@prisma/client';
import { IAuthSession, IAuthTokens } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { UtilHash } from 'src/shared/utils/hash.util';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokenService: UserTokenService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private readonly ACCESS_TOKEN_COOKIE = 'access_token';
  private readonly REFRESH_TOKEN_COOKIE = 'refresh_token';

  // =============================================================================
  //                            AUTHENTIFICATION
  // =============================================================================

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);

    if (!user)
      throw new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS);

    if (!user.password)
      throw new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS);

    const isPasswordValid = await this.__comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS);

    if (user.status === UserStatus.PENDING)
      throw new ForbiddenException(ErrorCodeEnum.ACCOUNT_PENDING);

    if (user.status === UserStatus.BANNED)
      throw new ForbiddenException(ErrorCodeEnum.USER_BANNED);

    return user;
  }

  async signUp(data: SignUpRequestDto): Promise<User> {
    const hashedPassword = await this.__hashPassword(data.password);

    const user = await this.userService.create({
      email: data.email,
      password: hashedPassword,
      loginMethod: LoginMethod.CLASSIC,
    });

    const userToken = await this.userTokenService.generateAndSave(
      { sub: user.id, email: user.email },
      TokenType.CONFIRM_ACCOUNT,
    );

    this.emailService.sendAccountConfirmationLink(
      user.id,
      user.email,
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}?token=${userToken.token}`,
    );

    return user;
  }

  async signIn(user: User): Promise<IAuthTokens> {
    const access = await this.userTokenService.generate(
      { email: user.email, sub: user.id },
      TokenType.ACCESS,
    );

    const refresh = await this.userTokenService.generateAndSave(
      { email: user.email, sub: user.id },
      TokenType.REFRESH,
    );

    return { accessToken: access.token, refreshToken: refresh.token };
  }

  async logout(token: string): Promise<void> {
    const { userToken } = await this.userTokenService.decodeAndGet(
      token,
      TokenType.REFRESH,
    );
    if (!userToken.id) throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);
    await this.userTokenService.remove(userToken.id);
  }

  async refresh(token: string): Promise<IAuthSession> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      token,
      TokenType.REFRESH,
    );

    if (!userToken.id || !userToken.token) throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    const user = await this.userService.findOneById(+payload.sub);
    if (!user) throw new UnauthorizedException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);

    const accessToken = await this.userTokenService.generate(
      { sub: user.id, email: user.email },
      TokenType.ACCESS,
    );
    const refreshToken = await this.userTokenService.generateAndSave(
      { sub: user.id, email: user.email },
      TokenType.REFRESH,
    );

    await this.userTokenService.remove(userToken.id);

    return {
      tokens: {
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
      },
      user,
    };
  }

  // =============================================================================
  //                          ACCOUNT MANAGEMENT
  // =============================================================================

  async reSendConfirmAccount(email: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);

    if (user.status !== UserStatus.PENDING)
      throw new UnauthorizedException(ErrorCodeEnum.ACCOUNT_ALREADY_CONFIRM);

    const userToken = await this.userTokenService.generateAndSave(
      { sub: user.id, email },
      TokenType.CONFIRM_ACCOUNT,
    );

    await this.emailService.reSendAccountConfirmationLink(
      user.id,
      email,
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}?token=${userToken.token}`,
    );

    return user;
  }

  async confirmAccount(
    confirmAccountDto: ConfirmAccountRequestDto,
  ): Promise<void> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      confirmAccountDto.token,
      TokenType.CONFIRM_ACCOUNT,
    );

    await this.userService.update(payload.sub, {
      status: UserStatus.ALLOWED,
    });

    await this.userTokenService.remove(userToken.id);
    return;
  }

  async forgotPassword(email: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) throw new NotFoundException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);

    const userToken = await this.userTokenService.generateAndSave(
      { email: user.email, sub: user.id },
      TokenType.FORGOT_PASSWORD,
    );

    await this.emailService.sendResetPasswordLink(
      user.id,
      user.email,
      `${this.configService.get('FRONT_URL_RESET_PASSWORD')}?token=${userToken.token}`,
    );

    return user;
  }

  async resetPassword(data: ResetPasswordRequestDto): Promise<void> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      data.token,
      TokenType.FORGOT_PASSWORD,
    );

    if (!userToken.id) throw new NotFoundException(ErrorCodeEnum.TOKEN_INVALID);

    const hashedPassword = await this.__hashPassword(data.password);

    await this.userService.update(payload.sub, {
      password: hashedPassword,
    });

    await this.userTokenService.remove(userToken.id);
    return;
  }

  // =============================================================================
  //                               GOOGLE
  // =============================================================================

  async validateOrCreateGoogleUser(
    googleId: string,
    googleEmail: string,
  ): Promise<User> {
    const existingUser = await this.userService.findOneByOauthId({
      oauthId: googleId,
      loginMethod: LoginMethod.GOOGLE,
    });

    if (existingUser) return existingUser;

    const existingEmailUser =
      await this.userService.findOneByEmail(googleEmail);

    if (existingEmailUser) {
      if (existingEmailUser.password)
        throw new ConflictException(
          ErrorCodeEnum.CLASSIC_ACCOUNT_ALREADY_EXISTS_ERROR,
        );
      if (existingEmailUser.loginMethod !== LoginMethod.GOOGLE)
        throw new ConflictException(
          ErrorCodeEnum.OAUTH_ACCOUNT_ALREADY_EXISTS_ERROR,
        );

      return await this.userService.update(existingEmailUser.id, {
        email: googleEmail,
        loginMethod: LoginMethod.GOOGLE,
        status: UserStatus.ALLOWED,
        oauthId: googleId,
      });
    }

    return await this.userService.create({
      email: googleEmail,
      loginMethod: LoginMethod.GOOGLE,
      status: UserStatus.ALLOWED,
      oauthId: googleId,
    });
  }

  // =============================================================================
  //                               GITHUB
  // =============================================================================

  async validateOrCreateGithubUser(
    githubId: string,
    githubEmail: string,
  ): Promise<User> {
    const existingUser = await this.userService.findOneByOauthId({
      oauthId: githubId,
      loginMethod: LoginMethod.GITHUB,
    });

    if (existingUser) return existingUser;

    const existingEmailUser =
      await this.userService.findOneByEmail(githubEmail);

    if (existingEmailUser) {
      if (existingEmailUser.password)
        throw new ConflictException(
          ErrorCodeEnum.CLASSIC_ACCOUNT_ALREADY_EXISTS_ERROR,
        );
      if (existingEmailUser.loginMethod !== LoginMethod.GITHUB)
        throw new ConflictException(
          ErrorCodeEnum.OAUTH_ACCOUNT_ALREADY_EXISTS_ERROR,
        );

      return await this.userService.update(existingEmailUser.id, {
        email: githubEmail,
        status: UserStatus.ALLOWED,
        loginMethod: LoginMethod.GITHUB,
        oauthId: githubId,
      });
    }

    return await this.userService.create({
      email: githubEmail,
      loginMethod: LoginMethod.GITHUB,
      status: UserStatus.ALLOWED,
      oauthId: githubId,
    });
  }

  // =============================================================================
  //                               OAUTH
  // =============================================================================

  async signInOauth(
    oauthId: string,
    loginMethod: LoginMethod,
  ): Promise<IAuthSession> {
    const user = await this.userService.findOneByOauthId({
      oauthId,
      loginMethod,
    });

    if (!user)
      throw new UnauthorizedException(ErrorCodeEnum.OAUTH_LOGIN_FAILED);

    const access = await this.userTokenService.generate(
      { email: user.email, sub: user.id },
      TokenType.ACCESS,
    );

    const refresh = await this.userTokenService.generateAndSave(
      { email: user.email, sub: user.id },
      TokenType.REFRESH,
    );

    return {
      tokens: { accessToken: access.token, refreshToken: refresh.token },
      user,
    };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __hashPassword(password: string): Promise<string> {
    const saltRound = Number(this.configService.get('HASH_SALT_ROUND')) || 12;
    return UtilHash.hash(password, saltRound);
  }

  private async __comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return UtilHash.compare(password, hashedPassword);
  }

  // =============================================================================
  //                               COOKIES
  // =============================================================================

  private __setAccessTokenCookie(res: Response, token: string): void {
    res.cookie(this.ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('JWT_ACCESS_EXPIRATION'),
      path: '/',
    });
  }

  private __setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(this.REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('JWT_REFRESH_EXPIRATION'),
      path: '/auth',
    });
  }

  setAuthCookies(res: Response, tokens: IAuthTokens): void {
    this.__setAccessTokenCookie(res, tokens.accessToken);
    this.__setRefreshTokenCookie(res, tokens.refreshToken);
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(this.ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/auth',
    });
  }
}
