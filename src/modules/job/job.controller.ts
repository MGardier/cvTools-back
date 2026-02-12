import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  HttpCode,
} from '@nestjs/common';

import { JobService } from './job.service';
import { CreateJobRequestDto } from './dto/request/create-job.dto';
import { UpdateJobRequestDto } from './dto/request/update-job.dto';
import { JobResponseDto } from './dto/response/job.dto';
import { SerializeWith, SkipSerialize } from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /********* CREATE *********/

  @Post()
  @SerializeWith(JobResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() createJobDto: CreateJobRequestDto,
  ): Promise<JobResponseDto> {
    return await this.jobService.create(req.user.sub, createJobDto);
  }

  /********* UPDATE *********/

  @Patch(':id')
  @SerializeWith(JobResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobRequestDto,
  ): Promise<JobResponseDto> {
    return await this.jobService.update(id, req.user.sub, updateJobDto);
  }

  /********* DELETE *********/

  @Delete(':id')
  @HttpCode(204)
  @SkipSerialize()
  async remove(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.jobService.delete(id, req.user.sub);
  }

  /********* FIND *********/

  @Get()
  @SerializeWith(JobResponseDto)
  async findAll(@Req() req: IAuthenticatedRequest): Promise<JobResponseDto[]> {
    return await this.jobService.findAll(req.user.sub);
  }

  @Get(':id')
  @SerializeWith(JobResponseDto)
  async findOne(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<JobResponseDto> {
    return await this.jobService.findOne(id, req.user.sub);
  }
}
