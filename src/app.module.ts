import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from '#prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { UserTokenModule } from './modules/user-token/user-token.module.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtManagerModule } from './modules/jwt-manager/jwt-manager.module.js';
import { validateEnv } from './app/config/env.validation.js';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter.js';
import { HttpExceptionFilter } from './app/filters/http-exception.filter.js';
import { PrismaClientExceptionFilter } from './app/filters/prisma-exception.filter.js';
import { ResponseInterceptor } from './app/interceptors/response.interceptor.js';
import { SerializeInterceptor } from './app/interceptors/serialize.interceptor.js';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard.js';
import { CacheManagerModule } from './modules/cache/cache-manager.module.js';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module.js';
import { ScraperModule } from './modules/scraper/scraper.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { OfferModule } from './modules/offer/offer.module.js';
import { CityModule } from './modules/city/city.module.js';
import { AdminInvitationModule } from './modules/admin-invitation/admin-invitation.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    RabbitmqModule,
    CacheManagerModule,
    UserModule,
    PrismaModule,
    AuthModule,
    EmailModule,
    UserTokenModule,
    JwtManagerModule,
    ScraperModule,
    OfferModule,
    CityModule,
    AdminInvitationModule,
    AdminModule,
    HealthModule,
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
