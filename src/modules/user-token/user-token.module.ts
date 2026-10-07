import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserTokenService } from './user-token.service.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module.js';
import { UserTokenRepository } from './user-token.repository.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    JwtManagerModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [UserTokenService, UserTokenRepository],
  exports: [UserTokenService],
})
export class UserTokenModule {}
