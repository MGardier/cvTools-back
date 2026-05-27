import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { ApplicationModule } from '../application/application.module';
import { TodoModule } from '../todo/todo.module';

@Module({
  imports: [ApplicationModule, TodoModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
