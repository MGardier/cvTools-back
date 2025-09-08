import { Address, ApplicationMethod, JobStatus, PriorityJob, Technology, TypeEnterprise } from "@prisma/client";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import {  UpsertTechnologyDto } from "../../technology/dto/upsert-technology.dto";
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
  @Transform(({ value }) => (value ? Number(value) : undefined)) 
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined)) 
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
  @Transform(({ value }) => (value ? new Date(value) : undefined)) 
  @IsDate()
  appliedAt?: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpsertTechnologyDto)
  technologies: UpsertTechnologyDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto

}
