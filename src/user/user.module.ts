import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { JobModule } from 'src/job/job.module';


@Module({
  imports: [JobModule],
  controllers: [UserController],
  providers: [UserService,UserRepository],
  exports: [UserService],
})
export class UserModule {}
