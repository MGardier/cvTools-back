import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AdminInvitation, Prisma } from '@prisma/client';
import { ICreateAdminInvitation } from './types';

@Injectable()
export class AdminInvitationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: ICreateAdminInvitation,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminInvitation> {
    const client = tx ?? this.prismaService;

    return await client.adminInvitation.create({ data });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findByUuid(uuid: string): Promise<AdminInvitation | null> {
    return await this.prismaService.adminInvitation.findUnique({
      where: { uuid },
    });
  }

  async findActiveByEmail(email: string): Promise<AdminInvitation | null> {
    return await this.prismaService.adminInvitation.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  // Used both to consume an invitation at registration and to revoke an
  // existing active invitation (same operation, distinct semantics).
  async markAsUsed(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminInvitation> {
    const client = tx ?? this.prismaService;

    return await client.adminInvitation.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
