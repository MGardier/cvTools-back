import { Injectable } from '@nestjs/common';
import { ApplicationHasContact, Contact, Prisma } from '@prisma/client';
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

  async delete(id: number, tx?: Prisma.TransactionClient): Promise<Contact> {
    const client = tx ?? this.prismaService;

    return await client.contact.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async search(
    userId: number,
    search?: string,
    limit = 20,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prismaService;

    return await client.contact.findMany({
      where: {
        createdBy: userId,
        ...(search && {
          OR: [
            { firstname: { contains: search, mode: 'insensitive' } },
            { lastname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { profession: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { _count: { select: { applicationContacts: true } } },
      orderBy: { lastname: 'asc' },
      take: limit,
    });
  }

  async findAllByApplicationId(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact[]> {
    const client = tx ?? this.prismaService;

    return await client.contact.findMany({
      where: { applicationContacts: { some: { applicationId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact | null> {
    const client = tx ?? this.prismaService;

    return await client.contact.findFirst({
      where: { id, createdBy: userId },
    });
  }

  // =============================================================================
  //                  APPLICATION-CONTACT (RELATION LINK)
  // =============================================================================

  async addApplicationLink(
    applicationId: number,
    contactId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasContact> {
    const client = tx ?? this.prismaService;

    return await client.applicationHasContact.create({
      data: { applicationId, contactId },
    });
  }

  async addManyApplicationLinks(
    applicationId: number,
    contactIds: number[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasContact.createMany({
      data: contactIds.map((contactId) => ({ applicationId, contactId })),
      skipDuplicates: true,
    });
  }

  async removeApplicationLink(
    applicationId: number,
    contactId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasContact.delete({
      where: {
        applicationId_contactId: { applicationId, contactId },
      },
    });
  }

  async removeAllApplicationLinks(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasContact.deleteMany({
      where: { applicationId },
    });
  }

  async countApplicationLinks(
    contactId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx ?? this.prismaService;

    return await client.applicationHasContact.count({
      where: { contactId },
    });
  }
}
