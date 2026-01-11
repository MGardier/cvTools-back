import { Job } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsObject, IsOptional, IsPositive, IsString, Validate } from "class-validator";
import { TSortItem } from "src/common/types/repository.types";
import { CustomSortFieldsValidator } from "src/common/pipes/custom-sort-fields-validator";


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