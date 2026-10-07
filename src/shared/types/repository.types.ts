import type { Prisma } from '#prisma/generated/client.js';

export interface IOptionRepository<TDataSelectedColumns> {
  tx?: Prisma.TransactionClient;
  selectedColumns?: (keyof TDataSelectedColumns)[];
}

export type TSortItem<TData> = {
  field: keyof TData;
  direction: Prisma.SortOrder;
};

export interface IFindAllResponse {
  limit: number;
  count: number;
  page: number;
  maxPage: number;
}
