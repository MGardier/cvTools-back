import { Job } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsObject, IsOptional, IsPositive, IsString, Validate } from "class-validator";
import { SortItem } from "src/interfaces/filter-options.interface";
import { CustomSortFieldsValidator } from "src/validators/custom-sort-fields-validator";


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