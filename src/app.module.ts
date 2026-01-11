import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UserTokenModule } from './modules/user-token/user-token.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { JwtManagerModule } from './modules/jwt-manager/jwt-manager.module';
import { TOKEN_TYPE } from './common/decorators/token-type.decorator';
import { validateEnv } from './common/config/env.validation';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/exceptions/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { CacheManagerModule } from './modules/cache/cache-manager.module';
import { JobModule } from './modules/job/job.module';
import { TechnologyModule } from './modules/technology/technology.module';
import { AddressModule } from './modules/address/address.module';
import { JobHasTechnologyModule } from './modules/job-has-technology/job-has-technology.module';



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
