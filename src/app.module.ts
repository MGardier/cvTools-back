import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UserTokenModule } from './user-token/user-token.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { JwtManagerModule } from './jwt-manager/jwt-manager.module';
import { TOKEN_TYPE } from './decorators/token-type.decorator';
import { validateEnv } from './config/env.validation';
import { GlobalExceptionFilter } from './filters/globalException.filter';
import { HttpExceptionFilter } from './filters/httpException.filter';
import { PrismaClientExceptionFilter } from './filters/prismaException.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AuthGuard } from './auth/guards/auth.guard';
import { CacheManagerModule } from './cache/cache-manager.module';
import { JobModule } from './job/job.module';
import { TechnologyModule } from './technology/technology.module';
import { AddressModule } from './address/address.module';
import { JobHasTechnologyModule } from './job-has-technology/job-has-technology.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,

    }),
    CacheManagerModule,
    UserModule,
    PrismaModule,
    AuthModule,
    EmailModule,
    UserTokenModule,
    JwtManagerModule,
    JobModule,
    TechnologyModule,
    AddressModule,
    JobHasTechnologyModule,

  ],
  controllers: [],
  providers: [
    PrismaService,
    PrismaClientExceptionFilter,
    HttpExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: TOKEN_TYPE,
      useValue: 'ACCESS',
    },
    {
      provide: APP_FILTER, useClass: GlobalExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

  ],
})
export class AppModule { }
