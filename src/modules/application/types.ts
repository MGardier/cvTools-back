import { Application, Address, Skill, Contact } from '@prisma/client';

export type TApplicationWithAddress = Application & { address: Address | null };

export type TApplicationWithAddressAndSkills = TApplicationWithAddress & {
  skills: Skill[];
};

export type TApplicationDetail = TApplicationWithAddress & {
  skills: Skill[];
  contacts: Contact[];
};

export enum EApplicationSortField {
  CREATED_AT = 'createdAt',
  APPLIED_AT = 'appliedAt',
  CURRENT_STATUS = 'currentStatus',
  TITLE = 'title',
  JOBBOARD = 'jobboard',
}
