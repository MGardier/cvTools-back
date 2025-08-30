import { Address, ApplicationMethod, JobStatus, PriorityJob, Technology, TypeEnterprise } from "@prisma/client";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateTechnologyDto } from "../../technology/dto/create-technology.dto";
import { CreateAddressDto } from "../../address/dto/create-address.dto";
import { Transform, Type } from "class-transformer";

export class CreateJobDto {

  @IsNotEmpty()
  @IsString()
  enterprise: string;

  @IsNotEmpty()
  @IsEnum(TypeEnterprise)
  type: TypeEnterprise;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  detailsToRemember?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  salaryMax?: number;

  @IsNotEmpty()
  @IsEnum(JobStatus)
  status: JobStatus;

  @IsNotEmpty()
  @IsEnum(PriorityJob)
  priority: PriorityJob;

  @IsNotEmpty()
  @IsEnum(ApplicationMethod)
  applicationMethod: ApplicationMethod;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  appliedAt?: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateTechnologyDto)
  technologies: CreateTechnologyDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  userId: number;

}
