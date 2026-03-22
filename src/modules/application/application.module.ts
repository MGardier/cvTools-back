import { Module, forwardRef } from '@nestjs/common';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from './application.repository';
import { AddressModule } from '../address/address.module';
import { SkillModule } from '../skill/skill.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [
    AddressModule,
    forwardRef(() => SkillModule),
    forwardRef(() => ContactModule),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
  exports: [ApplicationService],
})
export class ApplicationModule {}
