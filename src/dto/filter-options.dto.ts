import { Job } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsOptional, IsPositive, IsString, Validate } from "class-validator";
import { SortItem } from "src/interfaces/filter-options.interface";
import { CustomSortFieldsValidator } from "src/validators/custom-sort-fields-validator";

export class FilterOptionsDto<TData> {

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  page: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  limit: number;

  @IsOptional()
  @Transform(({ value }) => {
    console.log("transform : ", value)
    if (!value) return undefined;
    return value.split(',').map(item => {
      const [field, direction ] = item.split(':').map(s => s.trim());
      return { field, direction: direction.toLowerCase() };
    });
  })
  @Validate(CustomSortFieldsValidator<Job>,['jobTitle','enterprise','status','applicationMethod','appliedAt'])
  sort: SortItem<Job>[]

} 