import { Address, ApplicationMethod, JobStatus, CompatibilityJob, TypeEnterprise } from '@prisma/client';

export interface ICreateJob {
  /********************** STRING *********************/
  jobTitle: string;
  enterprise: string;
  link: string;
  description?: string;
  notes?: string;
  managerName?: string;
  managerEmail?: string;
  rejectedReason?: string;

  /********************** NUMBER ******************** */
  interviewCount: number;
  rating: number;

  /********************** BOOLEAN ******************** */
  isArchived: boolean;
  isFavorite: boolean;

  /********************** DATE ******************** */
  appliedAt?: Date;
  lastContactAt?: Date;

  /********************** ENUM ******************** */
  type: TypeEnterprise;
  status: JobStatus;
  compatibility: CompatibilityJob;
  applicationMethod: ApplicationMethod;

  /********************** RELATION ******************** */
  technologiesId: number[];
  address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
  userId: number;
}

export interface IUpdateJob extends Partial<ICreateJob> {}
