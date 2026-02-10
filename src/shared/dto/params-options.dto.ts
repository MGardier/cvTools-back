import { Transform } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

// tableau query params
export class ParamsOptionsDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  page: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  limit: number;
}
