import { Expose, Type } from 'class-transformer';

import {
  TApplicationCompleteness,
  TApplicationStatus,
  TApplicationType,
  TCreationMode,
  TRemoteType,
  TStackCategory,
} from '../../types';

export class ApplicationConditionsResponseDto {
  @Expose()
  contractType!: string | null;

  @Expose()
  city!: string | null;

  @Expose()
  postalCode!: string | null;

  @Expose()
  remoteType!: TRemoteType;

  @Expose()
  salary!: string | null;

  @Expose()
  requiredExperience!: string | null;
}

export class ApplicationDescriptionResponseDto {
  @Expose()
  quickOverview!: string | null;

  @Expose()
  role!: string | null;

  @Expose()
  missions!: string | null;

  @Expose()
  desiredProfile!: string | null;

  @Expose()
  techEnvironment!: string | null;

  @Expose()
  additionalInfo!: string | null;
}

export class ApplicationStackPrimaryItemResponseDto {
  @Expose()
  name!: string;

  @Expose()
  position!: number;
}

export class ApplicationStackDetailedItemResponseDto {
  @Expose()
  name!: string;

  @Expose()
  category!: TStackCategory;
}

export class ApplicationStackResponseDto {
  @Expose()
  @Type(() => ApplicationStackPrimaryItemResponseDto)
  primary!: ApplicationStackPrimaryItemResponseDto[];

  @Expose()
  @Type(() => ApplicationStackDetailedItemResponseDto)
  detailed!: ApplicationStackDetailedItemResponseDto[];
}

export class ApplicationResponseDto {
  @Expose()
  publicId!: string;

  @Expose()
  companyName!: string | null;

  @Expose()
  jobTitle!: string | null;

  @Expose()
  subject!: string | null;

  @Expose()
  url!: string | null;

  @Expose()
  source!: string | null;

  @Expose()
  type!: TApplicationType | null;

  @Expose()
  status!: TApplicationStatus;

  @Expose()
  completeness!: TApplicationCompleteness;

  @Expose()
  creationMode!: TCreationMode;

  @Expose()
  isArchived!: boolean;

  @Expose()
  isStackToComplete!: boolean;

  @Expose()
  appliedAt!: string | null;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => ApplicationConditionsResponseDto)
  conditions!: ApplicationConditionsResponseDto;

  @Expose()
  @Type(() => ApplicationDescriptionResponseDto)
  description!: ApplicationDescriptionResponseDto;

  @Expose()
  @Type(() => ApplicationStackResponseDto)
  stack!: ApplicationStackResponseDto;
}
