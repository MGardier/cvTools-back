import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobRepository } from './job.repository';
import { TechnologyModule } from 'src/modules/technology/technology.module';
import { JobHasTechnologyModule } from 'src/modules/job-has-technology/job-has-technology.module';

@Module({
    imports: [TechnologyModule, JobHasTechnologyModule],
  controllers: [JobController],
  providers: [JobService, JobRepository],
  exports : [JobService]

})
export class JobModule {}
