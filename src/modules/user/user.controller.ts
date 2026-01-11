import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/common/decorators/public.decorator';
import { JobService } from 'src/modules/job/job.service';
import { UpdateJobDto } from 'src/modules/job/dto/update-job.dto';
import { CreateJobDto } from 'src/modules/job/dto/create-job.dto';

import { Job } from '@prisma/client';
import { ParamsOptionsDto } from 'src/common/dto/params-options.dto';
import { FindAllJobDto } from 'src/modules/job/dto/find-all-job.dto';



@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jobService: JobService
  ) { }


  @Public()
  @Post('/:id/job')
  createJobForUser(@Param('id',ParseIntPipe) id: number, @Body() data: CreateJobDto):Promise<Job>  {
    return this.jobService.createJobForUser(id, data);
  }


  @Public()
  @Put('/:userId/job/:jobId')
  updateJobForUser(@Param('userId', ParseIntPipe) userId: number, @Param('jobId',ParseIntPipe) jobId: number, @Body() data: UpdateJobDto): Promise<Job> {
   return this.jobService.updateJobForUser(jobId,userId, data);
  }



  @Public()
  @Get('/:userId/job')
  async findAllJobForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query : FindAllJobDto,

) {
    return await this.jobService.findAllJobForUser(
      userId, 
      {
        selectedColumns : ['id', 'jobTitle', "enterprise", "status", "applicationMethod", "appliedAt"], 
        page : query.page,
        limit : query.limit,
        sort : query.sort,
        filters : {
        jobTitle: query.jobTitle,
        enterprise: query.enterprise,
        status : query.status,
        applicationMethod : query.applicationMethod,
      }
      }
    );
  }


  @Public()
  @Get('/:userId/job/:jobId')
  async findOneJobForUser(@Param('userId',ParseIntPipe) userId: number, @Param('jobId',ParseIntPipe) jobId: number,) {
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
    return await this.jobService.findOneJobForUser(userId, jobId, selectedColumns);
  }





}
