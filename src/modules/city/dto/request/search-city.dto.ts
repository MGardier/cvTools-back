import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

export class SearchCityRequestDto {
  @ValidateIf((o) => !o.postalCode)
  @IsString({ message: DtoErrorCodeEnum.CITY_OR_POSTAL_CODE_REQUIRED })
  @MaxLength(100, { message: DtoErrorCodeEnum.CITY_TOO_LONG })
  city?: string;

  @ValidateIf((o) => !o.city)
  @IsString({ message: DtoErrorCodeEnum.CITY_OR_POSTAL_CODE_REQUIRED })
  @MaxLength(10, { message: DtoErrorCodeEnum.CITY_POSTAL_CODE_TOO_LONG })
  postalCode?: string;

  @IsOptional()
  @Transform(({ value }) => (isNaN(+value) ? 10 : +value))
  @IsInt({ message: DtoErrorCodeEnum.CITY_LIMIT_INVALID })
  @IsPositive({ message: DtoErrorCodeEnum.CITY_LIMIT_INVALID })
  limit: number = 10;
}
