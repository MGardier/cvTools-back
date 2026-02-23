import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UserTokenModule } from './modules/user-token/user-token.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtManagerModule } from './modules/jwt-manager/jwt-manager.module';
import { validateEnv } from './app/config/env.validation';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { HttpExceptionFilter } from './app/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './app/filters/prisma-exception.filter';
import { ResponseInterceptor } from './app/interceptors/response.interceptor';
import { SerializeInterceptor } from './app/interceptors/serialize.interceptor';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { CacheManagerModule } from './modules/cache/cache-manager.module';
import { AddressModule } from './modules/address/address.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { ApplicationModule } from './modules/application/application.module';
import { ContactModule } from './modules/contact/contact.module';
import { SkillModule } from './modules/skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    RabbitmqModule,
    CacheManagerModule,
    UserModule,
    PrismaModule,
    AuthModule,
    EmailModule,
    UserTokenModule,
    JwtManagerModule,
    AddressModule,
    ApplicationModule,
    ContactModule,
    SkillModule,
  ],
  controllers: [],
  providers: [
    PrismaClientExceptionFilter,
    HttpExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
  ],
})
export class AppModule {}
