import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserTokenService } from './user-token/user-token.service.js';
import { UserTokenRepository } from './user-token/user-token.repository.js';
import { JwtManagerService } from './jwt-manager/jwt-manager.service.js';
import { UserModule } from '../user/user.module.js';
import { EmailModule } from '../email/email.module.js';
import { GoogleStrategy } from '#app/strategies/google.strategy.js';
import { GithubOauthStrategy } from '#app/strategies/github.strategy.js';
import { LocalStrategy } from '#app/strategies/local.strategy.js';
import { JwtAccessStrategy } from '#app/strategies/jwt-access.strategy.js';
import { JwtRefreshStrategy } from '#app/strategies/jwt-refresh.strategy.js';

@Module({
  imports: [
    UserModule,
    EmailModule,
    // Global: JwtService is available app-wide.
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserTokenService,
    UserTokenRepository,
    JwtManagerService,
    GoogleStrategy,
    GithubOauthStrategy,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
