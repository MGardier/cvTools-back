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

  async findAllByApplicationId(applicationId: number): Promise<Contact[]> {
    return await this.prismaService.contact.findMany({
      where: { applicationContacts: { some: { applicationId } } },
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
  ): Promise<void> {
    await this.prismaService.applicationHasContact.delete({
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

  async countApplicationLinks(contactId: number): Promise<number> {
    return await this.prismaService.applicationHasContact.count({
      where: { contactId },
    });
  }
}
