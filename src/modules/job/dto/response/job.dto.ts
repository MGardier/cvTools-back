import { Expose, Type } from 'class-transformer';
import {
  JobOrigin,
  JobStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';

import { AddressResponseDto } from 'src/modules/address/dto/response/address.dto';

export class JobResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  url: string;

  @Expose()
  company: string | null;

  @Expose()
  origin: JobOrigin;

  @Expose()
  status: JobStatus;

  @Expose()
  publishedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  salaryMin: number | null;

  @Expose()
  salaryMax: number | null;

  @Expose()
  apiOfferId: string | null;

  @Expose()
  description: string | null;

  @Expose()
  rejectedReason: string | null;

  @Expose()
  apiProvider: ApiProvider | null;

  @Expose()
  contractType: ContractType | null;

  @Expose()
  experience: ExperienceLevel | null;

  @Expose()
  remotePolicy: RemotePolicy | null;

  @Expose()
  compatibility: CompatibilityJob | null;

  @Expose()
  appliedAt: Date | null;

  @Expose()
  @Type(() => AddressResponseDto)
  address: AddressResponseDto | null;
}
