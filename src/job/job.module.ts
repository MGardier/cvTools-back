import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobRepository } from './job.repository';

@Module({
  controllers: [JobController],
  providers: [JobService,JobRepository],
})
export class JobModule {}
