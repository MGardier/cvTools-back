import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
  createJobForUser(@Param('id',ParseIntPipe) id: number, @Body() data: CreateJobDto) {
    return this.jobService.createJobForUser(id, data);
  }


  @Public()
  @Put('/:userId/job/:jobId')
  updateJobForUser(@Param('userId', ParseIntPipe) userId: number, @Param('jobId',ParseIntPipe) jobId: number, @Body() data: UpdateJobDto) {
   return this.jobService.updateJobForUser(jobId,userId, data);
  }



  @Public()
  @Get('/:id/job')
  async findJobsForUser(@Param('id', ParseIntPipe) id: number) {
    return await this.jobService.findAllForUser(id, ['id', 'jobTitle', "enterprise", "status", "applicationMethod", "appliedAt"]);
  }


  @Public()
  @Get('/:userId/job/:jobId')
  async findJobForUser(@Param('userId',ParseIntPipe) userId: number, @Param('jobId',ParseIntPipe) jobId: number,) {
    const selectedColumns: (keyof Job)[] = [
      "id",
      "interviewCount",
      "rating",

      "jobTitle",
      "enterprise",
      "link",
      "managerName",
      "managerEmail",
      "description",
      "notes",
      "rejectedReason",

      "type",
      "status",
      "compatibility",
      "applicationMethod",
      "isArchived",
      "isFavorite",

      "appliedAt",
      "lastContactAt",
      "createdAt"
    ]
    return await this.jobService.findJobForUser(userId, jobId, selectedColumns);
  }





}
