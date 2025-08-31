import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/decorators/public.decorator';
import { JobService } from 'src/job/job.service';
import { UpdateJobDto } from 'src/job/dto/update-job.dto';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,private readonly jobService : JobService) { }



    @Public()
    @Get('/:id/job')
    async findJobsForUser(@Param('id') id: string) {
      return await this.jobService.findAllForUser(+id);
    }



    @Public()
    @Get('/:userId/job/:jobId')
    async findJobForUser(@Param('userId') userId: string, @Param('jobId') jobId: string,) {
      return await this.jobService.findJobForUser(+userId,+jobId);
    }



    @Public()
    @Patch('/:userId/job/:jobId')
    async updateJobForUser(@Param('userId') userId: string, @Param('jobId') jobId: string,@Body() udateJobDto: UpdateJobDto ) {
      return await this.jobService.updateJobForUser(+userId,+jobId,udateJobDto);
    }


  // @Get()
  // async findAll() {
  //   return await this.userService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.userService.findOneById(+id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return await this.userService.update(+id, updateUserDto);
  // }

  // @Patch(':id')
  // async updateEmail(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return await this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.userService.remove(+id);
  // }

}
