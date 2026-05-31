import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminInvitation,
  LoginMethod,
  UserRoles,
  UserStatus,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'prisma/prisma.service';
import { AdminInvitationRepository } from './admin-invitation.repository';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { IAdminRegisterCredentials } from './types';
import { IAuthSession } from '../auth/types';
import { UtilHash } from 'src/shared/utils/hash.util';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class AdminInvitationService {
  constructor(
    private readonly adminInvitationRepository: AdminInvitationRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async createInvitation(email: string): Promise<{ rawToken: string }> {
    const activeAdmin = await this.userService.findActiveAdmin();
    if (activeAdmin) {
      throw new ConflictException(ErrorCodeEnum.DEFAULT_ALREADY_EXISTS_ERROR);
    }

    const existingInvitation =
      await this.adminInvitationRepository.findActiveByEmail(email);
    if (existingInvitation) {
      await this.adminInvitationRepository.markAsUsed(existingInvitation.id);
    }

    const rawToken = uuidv4();
    const tokenHash = await UtilHash.hash(rawToken, this.__getSaltRound());

    await this.adminInvitationRepository.create({
      email,
      uuid: rawToken,
      tokenHash,
      expiresAt: this.__buildExpiresAt(),
    });

    return { rawToken };
  }

  // =============================================================================
  //                               VALIDATE
  // =============================================================================

  async validateInvitation(rawToken: string): Promise<{ email: string }> {
    const invitation = await this.__validateAndGetInvitation(rawToken);

    return { email: invitation.email };
  }

  // =============================================================================
  //                               REGISTER
  // =============================================================================

  async register(
    rawToken: string,
    loginMethod: LoginMethod,
    credentials: IAdminRegisterCredentials,
  ): Promise<IAuthSession> {
    const invitation = await this.__validateAndGetInvitation(rawToken);

    const existingUser = await this.userService.findOneByEmail(
      invitation.email,
    );
    if (existingUser) {
      throw new ConflictException(ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR);
    }

    const credentialsData = credentials.password
      ? {
          password: await UtilHash.hash(
            credentials.password,
            this.__getSaltRound(),
          ),
        }
      : { oauthId: credentials.oauthId };

    const user = await this.prismaService.$transaction(async (tx) => {
      const created = await this.userService.create(
        {
          email: invitation.email,
          loginMethod,
          status: UserStatus.ALLOWED,
          roles: UserRoles.ADMIN,
          ...credentialsData,
        },
        tx,
      );
      await this.adminInvitationRepository.markAsUsed(invitation.id, tx);

      return created;
    });

    const tokens = await this.authService.signIn(user);

    return { tokens, user };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __validateAndGetInvitation(
    rawToken: string,
  ): Promise<AdminInvitation> {
    const invitation =
      await this.adminInvitationRepository.findByUuid(rawToken);

    if (!invitation || invitation.usedAt) {
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);
    }

    if (invitation.expiresAt < new Date()) {
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_EXPIRED);
    }

    const isValid = await UtilHash.compare(rawToken, invitation.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);
    }

    return invitation;
  }

  private __buildExpiresAt(): Date {
    const minutes = Number(
      this.configService.get('ADMIN_INVITATION_EXPIRES_MINUTES') ?? 15,
    );

    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private __getSaltRound(): number {
    return Number(this.configService.get('HASH_SALT_ROUND')) || 12;
  }
}
