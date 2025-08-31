import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobRepository } from './job.repository';
import { TechnologyModule } from 'src/technology/technology.module';

@Module({
    imports: [TechnologyModule],
  controllers: [JobController],
  providers: [JobService,JobRepository],
  exports : [JobService]

})
export class JobModule {}
