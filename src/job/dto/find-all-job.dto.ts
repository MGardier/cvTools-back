import { ApplicationMethod, Job, JobStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, Validate, ValidateNested } from "class-validator";
import { ParamsOptionsDto } from "src/dto/params-options.dto";
import { SortItem } from "src/interfaces/filter-options.interface";
import { CustomSortFieldsValidator } from "src/validators/custom-sort-fields-validator";



export class FindAllJobDto extends ParamsOptionsDto {

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    return value.split(',').map(item => {
      const [field, direction] = item.split(':').map(s => s.trim());
      return { field, direction: direction.toLowerCase() };
    });
  })
  @Validate(CustomSortFieldsValidator<Job>, ['jobTitle', 'enterprise', 'status', 'applicationMethod', 'appliedAt'])
  sort: SortItem<Job>[];



  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  enterprise?: string;


  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(ApplicationMethod)
  applicationMethod?: ApplicationMethod;
}
