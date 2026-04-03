// test/setup/setup-test-app.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { EmailService } from 'src/modules/email/email.service';

import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';

export async function setupTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue({
      sendAccountConfirmationLink: jest.fn(),
      reSendAccountConfirmationLink: jest.fn(),
      sendResetPasswordLink: jest.fn(),
    })
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