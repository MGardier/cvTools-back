import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { UserTokenModule } from '../user-token/user-token.module';
import { GoogleStrategy } from './strategies/google.strategy';


@Module({
  imports: [UserModule, EmailModule, UserTokenModule],
  controllers: [AuthController],
  providers: [AuthService,GoogleStrategy],
})
export class AuthModule {}
