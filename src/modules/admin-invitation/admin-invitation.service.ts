import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminInvitation, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'prisma/prisma.service';
import { AdminInvitationRepository } from './admin-invitation.repository';
import { UserService } from '../user/user.service';
import { UtilHash } from 'src/shared/utils/hash.util';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class AdminInvitationService {
  constructor(
    private readonly adminInvitationRepository: AdminInvitationRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async createInvitation(email: string): Promise<{ rawToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const activeAdmin = await this.userService.findActiveAdmin();
    if (activeAdmin) {
      throw new ConflictException(ErrorCodeEnum.DEFAULT_ALREADY_EXISTS_ERROR);
    }

    const existingInvitation =
      await this.adminInvitationRepository.findActiveByEmail(normalizedEmail);

    const rawToken = uuidv4();
    const tokenHash = await UtilHash.hash(rawToken, this.__getSaltRound());

    // Atomic: revoking the previous invitation and creating the new one must
    // not leave the email without a valid invitation on partial failure.
    await this.prismaService.$transaction(async (tx) => {
      if (existingInvitation) {
        await this.adminInvitationRepository.markAsUsed(
          existingInvitation.id,
          tx,
        );
      }

      await this.adminInvitationRepository.create(
        {
          email: normalizedEmail,
          uuid: rawToken,
          tokenHash,
          expiresAt: this.__buildExpiresAt(),
        },
        tx,
      );
    });

    return { rawToken };
  }

  // =============================================================================
  //                               VALIDATE
  // =============================================================================

  async validateInvitation(rawToken: string): Promise<{ email: string }> {
    const invitation = await this.getValidInvitation(rawToken);

    return { email: invitation.email };
  }

  // Validates the token (existence, single-use, expiry, hash) and returns the
  // invitation entity. Consumed by the admin module to register the admin.
  async getValidInvitation(rawToken: string): Promise<AdminInvitation> {
    if (!rawToken) {
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);
    }

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

  async markAsUsed(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminInvitation> {
    return this.adminInvitationRepository.markAsUsed(id, tx);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private __buildExpiresAt(): Date {
    const minutes = Number(
      this.configService.get('ADMIN_INVITATION_EXPIRES_MINUTES') ?? 15,
    );

    return new Date(Date.now() + minutes * 60 * 1000); // minutes → ms
  }

  private __getSaltRound(): number {
    return Number(this.configService.get('HASH_SALT_ROUND')) || 12;
  }
}
