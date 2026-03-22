import { Module, forwardRef } from '@nestjs/common';

import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillRepository } from './skill.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
  exports: [SkillService],
})
export class SkillModule {}
