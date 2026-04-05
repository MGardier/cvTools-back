import { Injectable } from '@nestjs/common';
import { ApplicationHistory, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ApplicationHistoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: Prisma.ApplicationHistoryUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHistory> {
    const client = tx ?? this.prismaService;

    return await client.applicationHistory.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.ApplicationHistoryUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHistory> {
    const client = tx ?? this.prismaService;

    return await client.applicationHistory.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<ApplicationHistory> {
    return await this.prismaService.applicationHistory.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
  ): Promise<ApplicationHistory[]> {
    return await this.prismaService.applicationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByIdAndApplicationId(
    id: number,
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHistory | null> {
    const client = tx ?? this.prismaService;

    return await client.applicationHistory.findFirst({
      where: { id, applicationId },
    });
  }
}
