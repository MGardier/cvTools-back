import { Job, JobStatus, Prisma, ApplicationMethod } from '@prisma/client';
import { OptionRepository } from "./options-repository.interface";


export interface SortItem<TData> {
  field: keyof TData;
  direction: Prisma.SortOrder;
}

export interface FilterOptions<TData> extends OptionRepository<TData> {
  limit: number;
  skip: number;
  sort: SortItem<TData>[]
  filters: {
    jobTitle?: string;
    enterprise?: string;
    status?: JobStatus;
    applicationMethod?: ApplicationMethod;
  }


}