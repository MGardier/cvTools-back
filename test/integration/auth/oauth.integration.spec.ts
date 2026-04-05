import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginMethod, User } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { setupTestApp, oauthMockUserRef } from '../../setup/setup-test-app';
import { resetDatabase } from '../../setup/reset-database';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import {
  createOAuthUser,
  createConfirmedUser,
  parseAuthCookies,
} from '../../setup/test-helper';

describe('OAuth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });


  // =============================================================================
  //                         GOOGLE CALLBACK
  // =============================================================================


  describe('GET /auth/google/callback', () => {

    /********* HAPPY PATH *********/

    it('should redirect to success URL and set auth cookies when user exists', async () => {
      const user = await createOAuthUser(prisma, LoginMethod.GOOGLE);
      oauthMockUserRef.current = user;

      const response = await request(app.getHttpServer())
        .get('/auth/google/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('loginMethod=GOOGLE');

      const cookies = parseAuthCookies(response);
      expect(cookies.accessToken).toBeTruthy();
      expect(cookies.refreshToken).toBeTruthy();
    });

    /********* MISSING OAUTH ID *********/

    it('should redirect to error URL when oauthId is missing', async () => {
      oauthMockUserRef.current = { oauthId: null } as Partial<User>;

      const response = await request(app.getHttpServer())
        .get('/auth/google/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain(
        `errorCode=${ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED}`,
      );
    });

    /********* USER NOT FOUND IN DB *********/

    it('should redirect to error URL when OAuth user does not exist in DB', async () => {
      oauthMockUserRef.current = { oauthId: 'unknown-google-id' } as Partial<User>;

      const response = await request(app.getHttpServer())
        .get('/auth/google/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain(
        `errorCode=${ErrorCodeEnum.OAUTH_LOGIN_FAILED}`,
      );
    });


  });


  // =============================================================================
  //                         GITHUB CALLBACK
  // =============================================================================


  describe('GET /auth/github/callback', () => {

    /********* HAPPY PATH *********/

    it('should redirect to success URL and set auth cookies when user exists', async () => {
      const user = await createOAuthUser(prisma, LoginMethod.GITHUB);
      oauthMockUserRef.current = user;

      const response = await request(app.getHttpServer())
        .get('/auth/github/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('loginMethod=GITHUB');

      const cookies = parseAuthCookies(response);
      expect(cookies.accessToken).toBeTruthy();
      expect(cookies.refreshToken).toBeTruthy();
    });

    /********* MISSING OAUTH ID *********/

    it('should redirect to error URL when oauthId is missing', async () => {
      oauthMockUserRef.current = { oauthId: null } as Partial<User>;

      const response = await request(app.getHttpServer())
        .get('/auth/github/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain(
        `errorCode=${ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED}`,
      );
    });
  });
});
