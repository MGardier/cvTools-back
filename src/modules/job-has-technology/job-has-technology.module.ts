import { Module } from '@nestjs/common';
import { JobHasTechnologyService } from './job-has-technology.service';
import { JobHasTechnologyRepository } from './job-has-technology.repository';
import { TechnologyModule } from 'src/modules/technology/technology.module';


@Module({
  exports : [JobHasTechnologyService],
  providers: [JobHasTechnologyService,JobHasTechnologyRepository],
  imports : [TechnologyModule]
})
export class JobHasTechnologyModule {}
