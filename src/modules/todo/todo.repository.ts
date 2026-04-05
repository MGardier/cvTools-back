import { Injectable } from '@nestjs/common';
import { Todo, Prisma, StatusTodo } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

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
}
