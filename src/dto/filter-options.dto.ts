import { Transform } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class FilterOptionsDto {

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  page: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  limit: number;

} 