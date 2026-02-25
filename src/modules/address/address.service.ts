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
        this.__mapUpdateDto(dto),
        tx,
      );

    return await this.addressRepository.create(
      this.__mapCreateDto(dto, tableName, tableId),
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

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private __mapCreateDto(
    dto: AddressInputDto,
    tableName: AddressTable,
    tableId: number,
  ): Prisma.AddressUncheckedCreateInput {
    return {
      city: dto.city,
      postalCode: dto.postalCode,
      street: dto.street ?? null,
      complement: dto.complement ?? null,
      streetNumber: dto.streetNumber ?? null,
      tableName,
      tableId,
    };
  }

  private __mapUpdateDto(
    dto: AddressInputDto,
  ): Prisma.AddressUncheckedUpdateInput {
    return {
      city: dto.city,
      postalCode: dto.postalCode,
      street: dto.street ?? null,
      complement: dto.complement ?? null,
      streetNumber: dto.streetNumber ?? null,
    };
  }
}
