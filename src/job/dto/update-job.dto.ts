import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateJobDto extends PartialType(CreateJobDto) {

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined)) 
  @IsNumber()
  interviewCount?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined)) 
  @IsNumber()
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined)) 
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined)) 
  @IsDate()
  lastContactAt?: Date

}
