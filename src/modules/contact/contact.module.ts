import { Module, forwardRef } from '@nestjs/common';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService],
})
export class ContactModule {}
