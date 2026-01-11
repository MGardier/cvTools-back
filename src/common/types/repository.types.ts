import { Job, JobStatus, Prisma, ApplicationMethod } from '@prisma/client';
import { ApiResponse } from 'nats/lib/jetstream/jsapi_types';

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
    jobTitle?: string;
    enterprise?: string;
    status?: JobStatus;
    applicationMethod?: ApplicationMethod;
  };
}

export interface IFindAllOptions<TData> extends IOptionRepository<TData> {
  page?: number;
  limit?: number;
  sort: TSortItem<Job>[];
  filters: {
    jobTitle?: string;
    enterprise?: string;
    status?: JobStatus;
    applicationMethod?: ApplicationMethod;
  };
}

export interface IFindAllResponse extends ApiResponse {
  limit: number;
  count: number;
  page: number;
  maxPage: number;
}
