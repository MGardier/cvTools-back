import { Application, Address } from '@prisma/client';

export type TApplicationWithAddress = Application & { address: Address | null };

export enum EApplicationSortField {
  CREATED_AT = 'createdAt',
  APPLIED_AT = 'appliedAt',
  CURRENT_STATUS = 'currentStatus',
  TITLE = 'title',
  JOBBOARD = 'jobboard',
}