import { Injectable } from '@nestjs/common';
import { Address, AddressTable, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { AddressInputDto } from './dto/request/create-address.dto';
import { IFindByEntity } from './types';
import {
  mapAddressDtoToCreateData,
  mapAddressDtoToUpdateData,
} from 'src/shared/utils/util-repository';

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

// =============================================================================
//                               CREATE
// =============================================================================

  async create(
    dto: AddressInputDto,
    tableName: AddressTable,
    tableId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const client = tx ?? this.prismaService;
    const data = mapAddressDtoToCreateData(dto, tableName, tableId);

    return await client.address.create({ data });
  }

// =============================================================================
//                               UPDATE
// =============================================================================

  async update(
    id: number,
    dto: AddressInputDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const client = tx ?? this.prismaService;
    const data = mapAddressDtoToUpdateData(dto);

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
}
