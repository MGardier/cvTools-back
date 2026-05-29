import { Injectable } from '@nestjs/common';
import { Todo, Prisma, StatusTodo } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TTodoStatusCounts, TTodoWithCompany } from './types';

@Injectable()
export class TodoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: Prisma.TodoUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Todo> {
    const client = tx ?? this.prismaService;

    return await client.todo.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.TodoUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Todo> {
    const client = tx ?? this.prismaService;

    return await client.todo.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<Todo> {
    return await this.prismaService.todo.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
    sort: 'asc' | 'desc' = 'desc',
    status?: StatusTodo,
  ): Promise<Todo[]> {
    return await this.prismaService.todo.findMany({
      where: {
        applicationId,
        ...(status && { status }),
      },
      orderBy: { createdAt: sort },
    });
  }

  async findOneByIdAndApplicationId(
    id: number,
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Todo | null> {
    const client = tx ?? this.prismaService;

    return await client.todo.findFirst({
      where: { id, applicationId },
    });
  }

  async findRecentByUserId(
    userId: number,
    limit: number,
  ): Promise<TTodoWithCompany[]> {
    return await this.prismaService.todo.findMany({
      where: {
        application: { userId },
        status: { notIn: [StatusTodo.DONE, StatusTodo.ARCHIVED] },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: { application: { select: { company: true } } },
    });
  }

  // =============================================================================
  //                               COUNT
  // =============================================================================

  async countByStatusForUser(userId: number): Promise<TTodoStatusCounts> {
    const grouped = await this.prismaService.todo.groupBy({
      by: ['status'],
      where: { application: { userId } },
      _count: { _all: true },
    });

    return grouped.reduce<TTodoStatusCounts>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});
  }

  async countByStatusForApplicationIds(
    userId: number,
    applicationIds: number[],
  ): Promise<Map<number, TTodoStatusCounts>> {
    if (applicationIds.length === 0) return new Map();

    const grouped = await this.prismaService.todo.groupBy({
      by: ['applicationId', 'status'],
      where: { applicationId: { in: applicationIds }, application: { userId } },
      _count: { _all: true },
    });

    return grouped.reduce<Map<number, TTodoStatusCounts>>((acc, row) => {
      const current = acc.get(row.applicationId) ?? {};
      current[row.status] = row._count._all;
      acc.set(row.applicationId, current);
      return acc;
    }, new Map());
  }
}
