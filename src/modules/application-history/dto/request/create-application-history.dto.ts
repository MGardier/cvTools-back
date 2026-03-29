import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationHistoryRequestDto {
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MaxLength(255, {
    message: 'La description ne peut pas dépasser 255 caractères',
  })
  description: string;

  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsEnum(ApplicationStatus, { message: 'Le statut doit être valide' })
  status: ApplicationStatus;

  @IsOptional()
  @IsDate({ message: 'La date doit être valide' })
  @Type(() => Date)
  doneAt?: Date;
}
