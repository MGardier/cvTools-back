import { Module, forwardRef } from '@nestjs/common';

import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository],
  exports: [NoteService],
})
export class NoteModule {}
