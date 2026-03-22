import { Injectable } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ApplicationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: Prisma.ApplicationUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const client = tx ?? this.prismaService;

    return await client.application.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.ApplicationUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const client = tx ?? this.prismaService;

    return await client.application.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<Application> {
    return await this.prismaService.application.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByUserId(userId: number): Promise<Application[]> {
    return await this.prismaService.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Application | null> {
    const client = tx ?? this.prismaService;

    return await client.application.findFirst({
      where: { id, userId },
    });
  }
}
