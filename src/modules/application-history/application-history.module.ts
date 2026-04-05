import { Module, forwardRef } from '@nestjs/common';

import { ApplicationHistoryController } from './application-history.controller';
import { ApplicationHistoryService } from './application-history.service';
import { ApplicationHistoryRepository } from './application-history.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  controllers: [ApplicationHistoryController],
  providers: [ApplicationHistoryService, ApplicationHistoryRepository],
  exports: [ApplicationHistoryService],
})
export class ApplicationHistoryModule {}
