import {
  Application,
  Address,
  ApplicationStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';

export type TApplicationWithAddress = Application & { address: Address | null };

export interface ICreateApplication {
  title: string;
  url: string;
  userId: number;
  jobboardId: number;
  contractType: ContractType;
  publishedAt?: Date;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
  apiOfferId?: string;
  description?: string;
  currentStatus?: ApplicationStatus;
  isFavorite?: boolean;
  apiProvider?: ApiProvider;
  experience?: ExperienceLevel;
  remotePolicy?: RemotePolicy;
  compatibility?: CompatibilityJob;
}

export interface IUpdateApplication {
  title?: string;
  url?: string;
  publishedAt?: Date | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  company?: string | null;
  apiOfferId?: string | null;
  description?: string | null;
  currentStatus?: ApplicationStatus;
  apiProvider?: ApiProvider | null;
  contractType?: ContractType;
  experience?: ExperienceLevel | null;
  remotePolicy?: RemotePolicy | null;
  compatibility?: CompatibilityJob | null;
  appliedAt?: Date | null;
  isFavorite?: boolean;
}
