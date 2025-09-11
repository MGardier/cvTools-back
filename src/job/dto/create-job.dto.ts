import { Address, ApplicationMethod, JobStatus, PriorityJob, Technology, TypeEnterprise } from "@prisma/client";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
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

  @IsNotEmpty()
  @IsEnum(JobStatus)
  status: JobStatus;

  @IsNotEmpty()
  @IsEnum(PriorityJob)
  priority: PriorityJob;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(ApplicationMethod)
  applicationMethod: ApplicationMethod;

  @IsNotEmpty()
  @Transform(({ value }) => (value  || value === 0 ? Number(value) : undefined)) 
  @IsNumber()
  interviewCount : number;

  @IsOptional()
  @IsString()
  rejectedReason ?: string;

  @IsNotEmpty()
  @Transform(({ value }) => (value  || value === 0 ? Number(value) : undefined)) 
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @Transform(Boolean) 
  @IsBoolean()
  archived : boolean





  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined)) 
  @IsDate()
  appliedAt?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined)) 
  @IsDate()
  lastContactAt?: Date;





  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpsertTechnologyDto)
  technologies: UpsertTechnologyDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto

}
