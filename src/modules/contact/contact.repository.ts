import { Injectable } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ContactRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                              CREATE
  // =============================================================================

  async create(
    data: Prisma.ContactUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact> {
    const client = tx ?? this.prismaService;

    return await client.contact.create({ data });
  }

  async createMany(
    data: Prisma.ContactUncheckedCreateInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.contact.createMany({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.ContactUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact> {
    const client = tx ?? this.prismaService;

    return await client.contact.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<Contact> {
    return await this.prismaService.contact.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByUserId(userId: number): Promise<Contact[]> {
    return await this.prismaService.contact.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByApplicationId(
    applicationId: number,
  ): Promise<Contact[]> {
    return await this.prismaService.contact.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: number): Promise<Contact | null> {
    return await this.prismaService.contact.findUnique({
      where: { id },
    });
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
  ): Promise<Contact | null> {
    return await this.prismaService.contact.findFirst({
      where: { id, createdBy: userId },
    });
  }
}
