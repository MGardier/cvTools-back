import { Module } from '@nestjs/common';
import { TechnologyService } from './technology.service';
import { TechnologyRepository } from './technology.repository';


@Module({
  exports:[TechnologyService],
  providers: [TechnologyService,TechnologyRepository],
})
export class TechnologyModule {}
