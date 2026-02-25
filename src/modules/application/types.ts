import {
  Application,
  Address,
  ApplicationStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  RemotePolicy,
  CompatibilityJob,
  Jobboard,
} from '@prisma/client';

export type TApplicationWithAddress = Application & { address: Address | null };

export interface ICreateApplication {
  title: string;
  url: string;
  jobboard: Jobboard;
  contractType: ContractType;
  publishedAt?: Date;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
  description?: string;
  currentStatus?: ApplicationStatus;
  experience?: ExperienceLevel;
  remotePolicy?: RemotePolicy;
  compatibility?: CompatibilityJob;
}

export interface IUpdateApplication extends  ICreateApplication{
  appliedAt?: Date | null;
  isFavorite?: boolean;
}
