import { Job, JobStatus, Prisma } from '@prisma/client';

export interface IOptionRepository<TDataSelectedColumns> {
  tx?: Prisma.TransactionClient;
  selectedColumns?: (keyof TDataSelectedColumns)[];
}

export type TSortItem<TData> = {
  field: keyof TData;
  direction: Prisma.SortOrder;
};

export interface IFilterOptions<TData> extends IOptionRepository<TData> {
  limit: number;
  skip: number;
  sort: TSortItem<TData>[];
  filters: {
    title?: string;
    company?: string;
    status?: JobStatus;
  };
}

export interface IFindAllOptions<TData> extends IOptionRepository<TData> {
  page?: number;
  limit?: number;
  sort: TSortItem<Job>[];
  filters: {
    title?: string;
    company?: string;
    status?: JobStatus;
  };
}

export interface IFindAllResponse {
  limit: number;
  count: number;
  page: number;
  maxPage: number;
}
