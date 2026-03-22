import { AddressTable } from '@prisma/client';

export interface IFindByEntity {
  tableName: AddressTable;
  tableId: number;
}
