import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminInvitation,
  LoginMethod,
  User,
  UserRoles,
  UserStatus,
} from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ICreateUser } from '../user/types';
import { AuthService } from '../auth/auth.service';
import { IAuthSession } from '../auth/types';
import { AdminInvitationService } from '../admin-invitation/admin-invitation.service';
import { UtilHash } from 'src/shared/utils/hash.util';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly adminInvitationService: AdminInvitationService,
  ) {}

  async registerWithPassword(
    rawToken: string,
    password: string,
  ): Promise<IAuthSession> {
    const invitation =
      await this.adminInvitationService.getValidInvitation(rawToken);
    await this.__ensureEmailAvailable(invitation.email);

    const user = await this.__createAdminAndConsume(invitation, {
      loginMethod: LoginMethod.CLASSIC,
      password: await UtilHash.hash(password, this.__getSaltRound()),
    });

    return { tokens: await this.authService.signIn(user), user };
  }

  async registerWithOauth(
    rawToken: string,
    oauthId: string,
    oauthEmail: string,
    loginMethod: LoginMethod,
  ): Promise<IAuthSession> {
    const invitation =
      await this.adminInvitationService.getValidInvitation(rawToken);

    if (invitation.email !== oauthEmail) {
      throw new UnauthorizedException(ErrorCodeEnum.OAUTH_EMAIL_MISMATCH);
    }

    await this.__ensureEmailAvailable(invitation.email);

    const user = await this.__createAdminAndConsume(invitation, {
      loginMethod,
      oauthId,
    });

    return { tokens: await this.authService.signIn(user), user };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __ensureEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException(ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR);
    }
  }

  private async __createAdminAndConsume(
    invitation: AdminInvitation,
    credentials: Pick<ICreateUser, 'loginMethod' | 'password' | 'oauthId'>,
  ): Promise<User> {
    return this.prismaService.$transaction(async (tx) => {
      const user = await this.userService.create(
        {
          email: invitation.email,
          status: UserStatus.ALLOWED,
          roles: UserRoles.ADMIN,
          ...credentials,
        },
        tx,
      );
      await this.adminInvitationService.markAsUsed(invitation.id, tx);

      return user;
    });
  }

  private __getSaltRound(): number {
    return Number(this.configService.get('HASH_SALT_ROUND')) || 12;
  }
}
