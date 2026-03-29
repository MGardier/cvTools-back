import { Expose, Type } from 'class-transformer';
import {
  ApplicationStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  Jobboard,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';

import { AddressResponseDto } from 'src/modules/address/dto/response/address.dto';
import { ContactResponseDto } from 'src/modules/contact/dto/response/contact.dto';
import { SkillResponseDto } from 'src/modules/skill/dto/response/skill.dto';

export class ApplicationResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  url: string;

  @Expose()
  company: string | null;

  @Expose()
  currentStatus: ApplicationStatus;

  @Expose()
  contractType: ContractType;

  @Expose()
  jobboard: Jobboard;

  @Expose()
  isFavorite: boolean;

  @Expose()
  publishedAt: Date | null;

  @Expose()
  appliedAt: Date | null;

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
  apiProvider: ApiProvider | null;

  @Expose()
  experience: ExperienceLevel | null;

  @Expose()
  remotePolicy: RemotePolicy | null;

  @Expose()
  compatibility: CompatibilityJob | null;

  @Expose()
  @Type(() => AddressResponseDto)
  address: AddressResponseDto | null;

  @Expose()
  @Type(() => SkillResponseDto)
  skills?: SkillResponseDto[];

  @Expose()
  @Type(() => ContactResponseDto)
  contacts?: ContactResponseDto[];
}
