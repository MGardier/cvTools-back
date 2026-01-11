import { Module } from '@nestjs/common';
import { UserTokenService } from './user-token.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { UserTokenRepository } from './user-token.repository';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    JwtManagerModule,
  ],
  controllers: [],
  providers: [UserTokenService,UserTokenRepository],
  exports: [UserTokenService],
})
export class UserTokenModule {}
