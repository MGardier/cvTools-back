import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NoteRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: Prisma.NoteUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Note> {
    const client = tx ?? this.prismaService;

    return await client.note.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.NoteUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Note> {
    const client = tx ?? this.prismaService;

    return await client.note.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<Note> {
    return await this.prismaService.note.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
    sort: 'asc' | 'desc' = 'desc',
  ): Promise<Note[]> {
    return await this.prismaService.note.findMany({
      where: { applicationId },
      orderBy: { createdAt: sort },
    });
  }

  async findOneByIdAndApplicationId(
    id: number,
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Note | null> {
    const client = tx ?? this.prismaService;

    return await client.note.findFirst({
      where: { id, applicationId },
    });
  }
}
