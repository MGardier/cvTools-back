import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserStatus } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { setupTestApp } from '../../setup/setup-test-app';
import { resetDatabase } from '../../setup/reset-database';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';
import {
  DEFAULT_CREDENTIALS,
  signUpUser,
  createConfirmedUser,
  signInUser,
  authenticateUser,
  parseAuthCookies,
  getEmailMock,
  extractTokenFromMockUrl,
} from '../../setup/test-helper';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });


  // =============================================================================
  //                            SIGN UP
  // =============================================================================


  describe('POST /auth/signUp', () => {

    /********* VALID SIGN UP *********/

    it('should return 201 and create user with PENDING status', async () => {
      const response = await signUpUser(app);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        status: 201,
        path: '/auth/signUp',
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
          status: UserStatus.PENDING,
          roles: 'USER',
        },
      });
      expect(response.body.timestamp).toBeDefined();

      const userInDb = await prisma.user.findUnique({
        where: { email: DEFAULT_CREDENTIALS.email },
      });

      expect(userInDb).not.toBeNull();
      expect(userInDb!.status).toBe(UserStatus.PENDING);
      expect(userInDb!.email).toBe(DEFAULT_CREDENTIALS.email);
    });

    /********* EMAIL INVALID *********/

    it('should return 400 when email is invalid', async () => {
      const response = await signUpUser(app, { email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([DtoErrorCodeEnum.EMAIL_INVALID]),
      );
    });

    it('should return 400 when email is empty', async () => {
      const response = await signUpUser(app, { email: '' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 400,
        message: ErrorCodeEnum.VALIDATION_ERROR,
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          DtoErrorCodeEnum.EMAIL_REQUIRED,
          DtoErrorCodeEnum.EMAIL_INVALID,
        ]),
      );
    });

    /********* PASSWORD INVALID *********/

    it('should return 400 when password is too short and does not match pattern', async () => {
      const response = await signUpUser(app, { password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 400,
        message: ErrorCodeEnum.VALIDATION_ERROR,
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          DtoErrorCodeEnum.PASSWORD_WEAK,
          DtoErrorCodeEnum.PASSWORD_MIN_LENGTH,
        ]),
      );
    });

    /********* EMAIL ALREADY EXISTS *********/

    it('should return 409 with EMAIL_ALREADY_EXISTS_ERROR when email is taken', async () => {
      await signUpUser(app);
      const response = await signUpUser(app);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 409,
        message: ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR,
      });
    });
  });


  // =============================================================================
  //                            SIGN IN
  // =============================================================================


  describe('POST /auth/signIn', () => {

    /********* HAPPY PATH *********/

    it('should return 201 with user data and set auth cookies', async () => {
      await createConfirmedUser(app, prisma);

      const { response, cookies } = await signInUser(app);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        status: 201,
        path: '/auth/signIn',
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
          status: UserStatus.ALLOWED,
          roles: 'USER',
        },
      });

      expect(cookies.accessToken).toBeTruthy();
      expect(cookies.refreshToken).toBeTruthy();
    });

    /********* EMAIL NOT FOUND *********/

    it('should return 401 when email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({ email: 'nonexistent@example.com', password: 'StrongPass1!' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        message: ErrorCodeEnum.INVALID_CREDENTIALS,
      });
    });

    /********* WRONG PASSWORD *********/

    it('should return 401 when password is wrong', async () => {
      await createConfirmedUser(app, prisma);

      const response = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({ email: DEFAULT_CREDENTIALS.email, password: 'WrongPass1!' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        message: ErrorCodeEnum.INVALID_CREDENTIALS,
      });
    });

    /********* ACCOUNT PENDING *********/

    it('should return 403 when account is PENDING', async () => {
      await signUpUser(app);

      const response = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send(DEFAULT_CREDENTIALS);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 403,
        message: ErrorCodeEnum.ACCOUNT_PENDING,
      });
    });

    /********* ACCOUNT BANNED *********/

    it('should return 403 when account is BANNED', async () => {
      const signUpResponse = await signUpUser(app);
      await prisma.user.update({
        where: { id: signUpResponse.body.data.id },
        data: { status: UserStatus.BANNED },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send(DEFAULT_CREDENTIALS);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 403,
        message: ErrorCodeEnum.USER_BANNED,
      });
    });
  });


  // =============================================================================
  //                              ME
  // =============================================================================


  describe('GET /auth/me', () => {

    /********* HAPPY PATH *********/

    it('should return 200 with user data when token is valid', async () => {
      const { cookies } = await authenticateUser(app, prisma);

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookies.raw);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        status: 200,
        path: '/auth/me',
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
          status: UserStatus.ALLOWED,
          roles: 'USER',
        },
      });
    });

    /********* NO TOKEN *********/

    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
    });
  });


  // =============================================================================
  //                            LOGOUT
  // =============================================================================


  describe('DELETE /auth/logout', () => {

    /********* HAPPY PATH *********/

    it('should return 204 and clear cookies', async () => {
      const { cookies } = await authenticateUser(app, prisma);

      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Cookie', cookies.raw);

      expect(response.status).toBe(204);

      const setCookieHeaders = response.headers['set-cookie'] as unknown as string[];
      const accessCookie = setCookieHeaders?.find((c: string) =>
        c.startsWith('access_token='),
      );
      const refreshCookie = setCookieHeaders?.find((c: string) =>
        c.startsWith('refresh_token='),
      );

      expect(accessCookie).toBeDefined();
      expect(accessCookie).toMatch(/access_token=;/);
      expect(accessCookie).toMatch(/Expires=Thu, 01 Jan 1970/);

      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toMatch(/refresh_token=;/);
      expect(refreshCookie).toMatch(/Expires=Thu, 01 Jan 1970/);

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies.raw);

      expect(refreshResponse.status).toBe(401);
    });

    /********* NO TOKEN *********/

    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/auth/logout',
      );

      expect(response.status).toBe(401);
    });
  });


  // =============================================================================
  //                            REFRESH
  // =============================================================================


  describe('POST /auth/refresh', () => {

    /********* HAPPY PATH *********/

    it('should return 201 with new cookies', async () => {
      const { cookies: oldCookies } = await authenticateUser(app, prisma);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', oldCookies.raw);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        status: 201,
        path: '/auth/refresh',
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
          status: UserStatus.ALLOWED,
          roles: 'USER',
        },
      });

      const newCookies = parseAuthCookies(response);
      expect(newCookies.accessToken).toBeTruthy();
      expect(newCookies.refreshToken).toBeTruthy();
    });

    /********* NO TOKEN *********/

    it('should return 401 when no refresh token is provided', async () => {
      const response = await request(app.getHttpServer()).post('/auth/refresh');

      expect(response.status).toBe(401);
    });
  });


  // =============================================================================
  //                       RESEND CONFIRM ACCOUNT
  // =============================================================================


  describe('POST /auth/resendConfirmAccount', () => {

    /********* HAPPY PATH *********/

    it('should return 201 with user data when user is PENDING', async () => {
      await signUpUser(app);

      const response = await request(app.getHttpServer())
        .post('/auth/resendConfirmAccount')
        .send({ email: DEFAULT_CREDENTIALS.email });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        status: 201,
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
          status: UserStatus.PENDING,
          roles: 'USER',
        },
      });

      const emailMock = getEmailMock(app);
      expect(emailMock.reSendAccountConfirmationLink).toHaveBeenCalledTimes(1);

    });

    /********* EMAIL NOT FOUND *********/

    it('should return 404 when email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resendConfirmAccount')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 404,
        message: ErrorCodeEnum.USER_NOT_FOUND_ERROR,
      });
    });

    /********* USER NOT PENDING *********/

    it('should return 401 when user is already confirmed', async () => {
      await createConfirmedUser(app, prisma);

      const response = await request(app.getHttpServer())
        .post('/auth/resendConfirmAccount')
        .send({ email: DEFAULT_CREDENTIALS.email });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        message: ErrorCodeEnum.ACCOUNT_ALREADY_CONFIRM,
      });
    });
  });


  // =============================================================================
  //                        CONFIRM ACCOUNT
  // =============================================================================


  describe('PATCH /auth/confirmAccount', () => {

    /********* HAPPY PATH *********/

    it('should return 200 and set user status to ALLOWED', async () => {
      const signUpResponse = await signUpUser(app);
      const userId = signUpResponse.body.data.id;

      const emailMock = getEmailMock(app);
      const token = extractTokenFromMockUrl(
        emailMock.sendAccountConfirmationLink as jest.Mock,
      );

      const response = await request(app.getHttpServer())
        .patch('/auth/confirmAccount')
        .send({ token });

      expect(response.status).toBe(200);

      const userInDb = await prisma.user.findUnique({ where: { id: userId } });
      expect(userInDb!.status).toBe(UserStatus.ALLOWED);
    });

    /********* INVALID TOKEN *********/

    it('should return 401 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/auth/confirmAccount')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });


  // =============================================================================
  //                        FORGOT PASSWORD
  // =============================================================================


  describe('POST /auth/forgotPassword', () => {

    /********* HAPPY PATH *********/

    it('should return 201 with user data', async () => {
      await createConfirmedUser(app, prisma);

      const response = await request(app.getHttpServer())
        .post('/auth/forgotPassword')
        .send({ email: DEFAULT_CREDENTIALS.email });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        status: 201,
        data: {
          id: expect.any(Number),
          email: DEFAULT_CREDENTIALS.email,
        },
      });

      const emailMock = getEmailMock(app);
      expect(emailMock.sendResetPasswordLink).toHaveBeenCalledTimes(1);
    });

    /********* EMAIL NOT FOUND *********/

    it('should return 404 when email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgotPassword')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 404,
        message: ErrorCodeEnum.USER_NOT_FOUND_ERROR,
      });
    });
  });


  // =============================================================================
  //                        RESET PASSWORD
  // =============================================================================


  describe('PATCH /auth/resetPassword', () => {

    /********* HAPPY PATH *********/

    it('should return 200 and change password (old fails, new works)', async () => {
      await createConfirmedUser(app, prisma);

      await request(app.getHttpServer())
        .post('/auth/forgotPassword')
        .send({ email: DEFAULT_CREDENTIALS.email });

      const emailMock = getEmailMock(app);
      const token = extractTokenFromMockUrl(
        emailMock.sendResetPasswordLink as jest.Mock,
      );

      const newPassword = 'NewStrongPass1!';

      const response = await request(app.getHttpServer())
        .patch('/auth/resetPassword')
        .send({ token, password: newPassword });

      expect(response.status).toBe(200);

      const signInOld = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({ email: DEFAULT_CREDENTIALS.email, password: DEFAULT_CREDENTIALS.password });
      expect(signInOld.status).toBe(401);

      const signInNew = await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({ email: DEFAULT_CREDENTIALS.email, password: newPassword });
      expect(signInNew.status).toBe(201);
    });

    /********* INVALID TOKEN *********/

    it('should return 401 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/auth/resetPassword')
        .send({ token: 'invalid-token', password: 'NewStrongPass1!' });

      expect(response.status).toBe(401);
    });
  });
});
