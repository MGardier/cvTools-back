import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { UserTokenModule } from '../user-token/user-token.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubOauthStrategy } from './strategies/github.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [UserModule, EmailModule, UserTokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GithubOauthStrategy,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
