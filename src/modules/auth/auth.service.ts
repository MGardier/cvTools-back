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
import { SignInRequestDto } from './dto/request/sign-in.dto';
import { ConfirmAccountRequestDto } from './dto/request/confirm-account.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.dto';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { LoginMethod, User, UserStatus } from '@prisma/client';
import { IAuthSession, TUserAccountStatus } from './types';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { UtilHash } from 'src/common/utils/util-hash';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokenService: UserTokenService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /***************************************** AUTHENTIFICATION ***************************************************************************************/

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
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}/${userToken.token}`,
    );
    
    return user;
  }

  async signIn(data: SignInRequestDto): Promise<IAuthSession> {
    const user = await this.userService.findOneByEmail(data.email);
    if (
      !user ||
      !user.password ||
      !(await this.__comparePassword(data.password, user.password))
    )
      throw new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS);

    if (user.status === UserStatus.PENDING)
      throw new ForbiddenException(ErrorCodeEnum.ACCOUNT_PENDING);

    if (user.status === UserStatus.BANNED)
      throw new ForbiddenException(ErrorCodeEnum.USER_BANNED);

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

  async logout(token: string): Promise<boolean> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      token,
      TokenType.REFRESH,
    );
    if (!userToken.id) throw new UnauthorizedException();

    const user = await this.userService.findOneById(+payload.sub);
    if (!user) throw new UnauthorizedException();

    await this.userTokenService.remove(userToken.id);
    return true;
  }

  async refresh(token: string): Promise<IAuthSession> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      token,
      TokenType.REFRESH,
    );

    if (!userToken.id || !userToken.token) throw new UnauthorizedException();

    const user = await this.userService.findOneById(+payload.sub);
    if (!user) throw new UnauthorizedException('User was not found');

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

  /************************ ACCOUNT MANAGEMENT **********************************************************/

  async reSendConfirmAccount(email: string): Promise<TUserAccountStatus> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);

    if (user.status !== UserStatus.PENDING) throw new UnauthorizedException(ErrorCodeEnum.ACCOUNT_ALREADY_CONFIRM);

    const userToken = await this.userTokenService.generateAndSave(
      { sub: user.id, email },
      TokenType.CONFIRM_ACCOUNT,
    );

    await this.emailService.reSendAccountConfirmationLink(
      user.id,
      email,
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}?token=${userToken.token}`,
    );

    return { id: user.id, email: user.email, status: user.status };
  }

  async confirmAccount(
    confirmAccountDto: ConfirmAccountRequestDto,
  ): Promise<boolean> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      confirmAccountDto.token,
      TokenType.CONFIRM_ACCOUNT,
    );

    await this.userService.update(payload.sub, {
      status: UserStatus.ALLOWED,
    });

    await this.userTokenService.remove(userToken.id);
    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);

    if (user) {
      const userToken = await this.userTokenService.generateAndSave(
        { email: user.email, sub: user.id },
        TokenType.FORGOT_PASSWORD,
      );

      await this.emailService.sendResetPasswordLink(
        user.id,
        user.email,
        `${this.configService.get('FRONT_URL_RESET_PASSWORD')}?token=${userToken.token}`,
      );
    }

    return true;
  }

  async resetPassword(data: ResetPasswordRequestDto): Promise<boolean> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      data.token,
      TokenType.FORGOT_PASSWORD,
    );

    if (!userToken.id) throw new NotFoundException();

    
    const hashedPassword = await this.__hashPassword(data.password);

    await this.userService.update(payload.sub, {
      password: hashedPassword,
    });

    await this.userTokenService.remove(userToken.id);
    return true;
  }

  /********************************************* GOOGLE METHOD *********************************************************************************************** */

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

  /********************************************* GITHUB METHOD *********************************************************************************************** */

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

  /********************************************* OAUTH METHOD *********************************************************************************************** */

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

  /********************************************* PRIVATE METHOD *********************************************************************************************** */

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
}
