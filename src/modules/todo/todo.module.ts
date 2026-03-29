import { Module, forwardRef } from '@nestjs/common';

import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoRepository } from './todo.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository],
  exports: [TodoService],
})
export class TodoModule {}
