import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/decorators/public.decorator';
import { JobService } from 'src/job/job.service';
import { UpdateJobDto } from 'src/job/dto/update-job.dto';
import { CreateJobDto } from 'src/job/dto/create-job.dto';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jobService: JobService) { }


  @Public()
  @Post('/:id/job')
  createJobForUser(@Param('id') id: string,@Body() createJobDto: CreateJobDto) {
    return this.jobService.createJobForUser(+id,createJobDto);
  }



  @Public()
  @Get('/:id/job')
  async findJobsForUser(@Param('id') id: string) {
    return await this.jobService.findAllForUser(+id);
  }


  @Public()
  @Get('/:userId/job/:jobId')
  async findJobForUser(@Param('userId') userId: string, @Param('jobId') jobId: string,) {
    return await this.jobService.findJobForUser(+userId, +jobId);
  }



  @Public()
  @Patch('/:userId/job/:jobId')
  async updateJobForUser(@Param('userId') userId: string, @Param('jobId') jobId: string, @Body() udateJobDto: UpdateJobDto) {
    return await this.jobService.updateJobForUser(+userId, +jobId, udateJobDto);
  }


  @Public()
  @Delete('/:userId/job/:jobId')
  async deleteJobForUser(@Param('userId') userId: string, @Param('jobId') jobId: string) {
    return await this.jobService.deleteJobForUser(+userId, +jobId);
  }

}
