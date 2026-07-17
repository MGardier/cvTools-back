import { Injectable } from '@nestjs/common';
import { Application, ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { IApplicationFindAllOptions } from 'src/shared/types/repository.types';

@Injectable()
export class ApplicationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // ==========================================================================
  //                                 REFACTORED
  //    New code compliant with the Candidature refactor (Lot 1 - CAND-xxx)
  // ==========================================================================

  // --------------------------------- CREATE ---------------------------------

  async create(
    data: Prisma.ApplicationUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const client = tx ?? this.prismaService;

    return await client.application.create({ data });
  }

  // ==========================================================================
  //                                   LEGACY
  //    Old code - move above to REFACTORED when reused/adapted, else delete
  // ==========================================================================

  // --------------------------------- UPDATE ---------------------------------

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

  // --------------------------------- DELETE ---------------------------------

  async delete(id: number): Promise<Application> {
    return await this.prismaService.application.delete({
      where: { id },
    });
  }

  // ---------------------------------- FIND ----------------------------------

  async findAllByUserId(
    userId: number,
    options: IApplicationFindAllOptions = {},
  ) {
    const where: Prisma.ApplicationWhereInput = { userId };

    if (options.currentStatus !== undefined)
      where.currentStatus = options.currentStatus;
    if (options.company)
      where.company = { contains: options.company, mode: 'insensitive' };
    if (options.createdAt) where.createdAt = { gte: options.createdAt };
    if (options.appliedAt) where.appliedAt = { gte: options.appliedAt };
    if (options.cityApplicationIds?.length)
      where.id = { in: options.cityApplicationIds };

    if (options.keyword) {
      where.OR = [
        { title: { contains: options.keyword, mode: 'insensitive' } },
        { company: { contains: options.keyword, mode: 'insensitive' } },
        {
          applicationSkills: {
            some: {
              skill: {
                label: { contains: options.keyword, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput =
      options.sortField
        ? { [options.sortField]: options.sortDirection ?? 'desc' }
        : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prismaService.application.findMany({
        where,
        orderBy,
        skip: options.skip ?? 0,
        take: options.take ?? 10,
        include: {
          applicationSkills: {
            include: { skill: true },
          },
        },
      }),
      this.prismaService.application.count({ where }),
    ]);

    return { items, total };
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prismaService;

    return await client.application.findFirst({
      where: { id, userId },
      include: {
        applicationSkills: { include: { skill: true } },
        applicationContacts: { include: { contact: true } },
      },
    });
  }

  async findRecentByUserId(userId: number, limit: number) {
    return await this.prismaService.application.findMany({
      where: { userId },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        applicationSkills: { include: { skill: true } },
      },
    });
  }

  // --------------------------------- COUNT ----------------------------------

  async countByStatusForUser(
    userId: number,
  ): Promise<Partial<Record<ApplicationStatus, number>>> {
    const grouped = await this.prismaService.application.groupBy({
      by: ['currentStatus'],
      where: { userId },
      _count: { _all: true },
    });

    return grouped.reduce<Partial<Record<ApplicationStatus, number>>>(
      (acc, row) => {
        acc[row.currentStatus] = row._count._all;
        return acc;
      },
      {},
    );
  }
}
