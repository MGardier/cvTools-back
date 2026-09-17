import { Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [JwtManagerService],
  exports: [JwtManagerService],
})
export class JwtManagerModule {}
