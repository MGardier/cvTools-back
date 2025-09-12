import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/decorators/public.decorator';
import { JobService } from 'src/job/job.service';
import { UpdateJobDto } from 'src/job/dto/update-job.dto';
import { CreateJobDto } from 'src/job/dto/create-job.dto';

import { Job } from '@prisma/client';



@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jobService: JobService
  ) { }


  @Public()
  @Post('/:id/job')
  createJobForUser(@Param('id') id: string, @Body() createJobDto: CreateJobDto) {
    return this.jobService.createJobForUser(+id, createJobDto);
  }



  @Public()
  @Get('/:id/job')
  async findJobsForUser(@Param('id', ParseIntPipe) id: number) {
    return await this.jobService.findAllForUser(id, ['id', 'jobTitle', "enterprise", "status", "applicationMethod", "appliedAt"]);
  }


  @Public()
  @Get('/:id/job/:jobId')
  async findJobForUser(@Param('id') userId: string, @Param('jobId') jobId: string,) {
    const selectedColumns: (keyof Job)[] = [
      "id",
      "enterprise",
      "type",
      "link",
      "jobTitle",
      "managerName",
      "managerEmail",
      "status",
      "compatibility",
      "description",
      "applicationMethod",
      "interviewCount",
      "rejectedReason",
      "rating",
      "archived",
      "appliedAt",
      "lastContactAt"
    ]
    return await this.jobService.findJobForUser(+userId, +jobId, selectedColumns);
  }





}
