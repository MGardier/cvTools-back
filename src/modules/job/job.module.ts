import { Module } from '@nestjs/common';

import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobRepository } from './job.repository';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [AddressModule],
  controllers: [JobController],
  providers: [JobService, JobRepository],
  exports: [JobService],
})
export class JobModule {}
