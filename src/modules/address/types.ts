import { Address, AddressTable } from '@prisma/client';

export type TCreateAddress  = Omit<Address,'id' | 'createdAt'|'updatedAt'>


export type TUpdateAddress = Partial<Omit<TCreateAddress,'tableId'| 'tableName'>>

export interface IFindByEntity {
  tableName: AddressTable;
  tableId: number;
}

export type TUpsertAddress = TCreateAddress;