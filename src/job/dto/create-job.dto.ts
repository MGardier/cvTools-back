import {  ApplicationMethod, JobStatus, CompatibilityJob, Technology, TypeEnterprise } from "@prisma/client";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateTechnologyDto} from "../../technology/dto/create-technology.dto";
import { CreateAddressDto } from "../../address/dto/create-address.dto";
import { Transform, Type } from "class-transformer";

export class CreateJobDto {



/********************** STRING ******************** */

  /****** REQUIRED ******/

  @IsNotEmpty()
  @IsString()
  enterprise: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  /****** OPTIONNAL ******/

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
  
  @IsOptional()
  @IsString()
  rejectedReason?: string;

/********************** ENUM ******************** */

  @IsNotEmpty()
  @IsEnum(TypeEnterprise)
  type: TypeEnterprise;


  @IsNotEmpty()
  @IsEnum(JobStatus)
  status: JobStatus;

  @IsNotEmpty()
  @IsEnum(CompatibilityJob)
  compatibility: CompatibilityJob;

  @IsNotEmpty()
  @IsEnum(ApplicationMethod)
  applicationMethod: ApplicationMethod;



/********************** NUMBER ******************** */
  @IsNotEmpty()
  @Transform(({ value }) => (value || value === 0 ? Number(value) : undefined))
  @IsNumber()
  interviewCount: number;

  @IsNotEmpty()
  @Transform(({ value }) => (value || value === 0 ? Number(value) : undefined))
  @IsNumber()
  rating: number;


/********************** BOOLEAN ******************** */

  @IsNotEmpty()
  @Transform(Boolean)
  @IsBoolean()
  isArchived: boolean

  @IsNotEmpty()
  @Transform(Boolean)
  @IsBoolean()
  isFavorite: boolean



/********************** DATE ******************** */
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  appliedAt?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  lastContactAt?: Date;


/********************** OBJECT ******************** */
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateTechnologyDto)
  technologies: CreateTechnologyDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto

}
