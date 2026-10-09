import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { EmailModule } from '../email/email.module.js';
import { UserTokenModule } from '../user-token/user-token.module.js';
import { GoogleStrategy } from '#app/strategies/google.strategy.js';
import { GithubOauthStrategy } from '#app/strategies/github.strategy.js';
import { LocalStrategy } from '#app/strategies/local.strategy.js';
import { JwtAccessStrategy } from '#app/strategies/jwt-access.strategy.js';
import { JwtRefreshStrategy } from '#app/strategies/jwt-refresh.strategy.js';

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
  exports: [AuthService],
})
export class AuthModule {}
