import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { IFindByEntity } from './types';

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    data: Prisma.AddressUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const client = tx ?? this.prismaService;

    return await client.address.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.AddressUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const client = tx ?? this.prismaService;

    return await client.address.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, tx?: Prisma.TransactionClient): Promise<Address> {
    const client = tx ?? this.prismaService;

    return await client.address.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findByEntity(
    data: IFindByEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<Address | null> {
    const client = tx ?? this.prismaService;

    return await client.address.findFirst({
      where: {
        tableName: data.tableName,
        tableId: data.tableId,
      },
    });
  }

  async findEntityIdsByCity(
    tableName: Address['tableName'],
    city: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number[]> {
    const client = tx ?? this.prismaService;

    const addresses = await client.address.findMany({
      where: {
        tableName,
        city: { contains: city, mode: 'insensitive' },
      },
      select: { tableId: true },
    });

    return addresses.map((a) => a.tableId);
  }
}
