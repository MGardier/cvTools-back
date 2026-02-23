import { Injectable } from '@nestjs/common';
import { Address, AddressTable, Prisma } from '@prisma/client';

import { AddressRepository } from './address.repository';
import { AddressInputDto } from './dto/request/create-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  // =============================================================================
  //                               UPSERT
  // =============================================================================

  async upsert(
    dto: AddressInputDto,
    tableName: AddressTable,
    tableId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const existing = await this.addressRepository.findByEntity(
      { tableName, tableId },
      tx,
    );

    if (existing)
      return await this.addressRepository.update(
        existing.id,
        dto,
        tx,
      );

    return await this.addressRepository.create(
      dto,
      tableName,
      tableId,
      tx,
    );
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findByEntity(
    tableName: AddressTable,
    tableId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Address | null> {
    return await this.addressRepository.findByEntity(
      { tableName, tableId },
      tx,
    );
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async deleteByEntity(
    tableName: AddressTable,
    tableId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const existing = await this.addressRepository.findByEntity(
      { tableName, tableId },
      tx,
    );

    if (existing)
      await this.addressRepository.delete(existing.id, tx);
  }
}
