import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationRequestDto } from './create-application.dto';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateApplicationRequestDto extends PartialType(
  CreateApplicationRequestDto,
) {
  @IsOptional()
  @IsDate({ message: 'La date doit être une date valide.' })
  @Type(() => Date)
  appliedAt?: Date;
  @IsOptional()
  @IsBoolean({ message: 'isFavorite doit être un booléen.' })
  isFavorite?: boolean;
  /********* OPTIONAL NESTED OBJECT *********/

  @IsOptional()
  @IsBoolean({ message: 'disconnectAddress doit être un booléen.' })
  disconnectAddress?: boolean;
}
