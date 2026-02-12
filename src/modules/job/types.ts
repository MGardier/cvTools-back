import {
  Prisma,
  JobOrigin,
  JobStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';

export type TJobWithRelations = Prisma.JobGetPayload<{
  include: { address: true };
}>;

export interface ICreateJob {
  title: string;
  url: string;
  origin: JobOrigin;
  publishedAt: Date;
  userId: number;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
  apiOfferId?: string;
  description?: string;
  status?: JobStatus;
  apiProvider?: ApiProvider;
  contractType?: ContractType;
  experience?: ExperienceLevel;
  remotePolicy?: RemotePolicy;
  compatibility?: CompatibilityJob;
  addressId?: number;
}

export interface IUpdateJob {
  title?: string;
  url?: string;
  origin?: JobOrigin;
  publishedAt?: Date;
  salaryMin?: number | null;
  salaryMax?: number | null;
  company?: string | null;
  apiOfferId?: string | null;
  description?: string | null;
  rejectedReason?: string | null;
  status?: JobStatus;
  apiProvider?: ApiProvider | null;
  contractType?: ContractType | null;
  experience?: ExperienceLevel | null;
  remotePolicy?: RemotePolicy | null;
  compatibility?: CompatibilityJob | null;
  appliedAt?: Date | null;
  addressId?: number | null;
}

export interface IAddressInput {
  city: string;
  postalCode: string;
}
