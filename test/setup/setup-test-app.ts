// test/setup/setup-test-app.ts
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '#src/app.module.js';
import { EmailService } from '#src/modules/email/email.service.js';
import { GoogleOauthGuard } from '#src/shared/guards/google-oauth.guard.js';
import { GithubOauthGuard } from '#src/shared/guards/github-oauth.guard.js';
import type { IMockUserRef } from './types.js';

import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';

export const oauthMockUserRef: IMockUserRef = { current: {} };

const mockOAuthGuard: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = oauthMockUserRef.current;
    return true;
  },
};

export async function setupTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue({
      sendAccountConfirmationLink: vi.fn(),
      reSendAccountConfirmationLink: vi.fn(),
      sendResetPasswordLink: vi.fn(),
    })
    .overrideGuard(GoogleOauthGuard)
    .useValue(mockOAuthGuard)
    .overrideGuard(GithubOauthGuard)
    .useValue(mockOAuthGuard)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //Supertest doesn't use http so CORS doesnt work and it's not added

  app.use(cookieParser());

  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 600000,
        secure: false,
      },
    }),
  );

  app.use(passport.initialize());

  await app.init();
  return app;
}
