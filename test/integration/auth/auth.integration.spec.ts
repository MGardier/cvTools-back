import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserStatus } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { setupTestApp } from '../../setup/setup-test-app';
import { resetDatabase } from '../../setup/reset-database';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

describe('POST /auth/signUp', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const VALID_SIGNUP = {
    email: 'test@example.com',
    password: 'StrongPass1!',
  };

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
  //                            SIGN UP
  // =============================================================================


  /********* VALID SIGN UP *********/

  it('should return 201 and create user with PENDING status', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send(VALID_SIGNUP);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      status: 201,
      path: '/auth/signUp',
      data: {
        id: expect.any(Number),
        email: VALID_SIGNUP.email,
        status: UserStatus.PENDING,
        roles: 'USER',
      },
    });
    expect(response.body.timestamp).toBeDefined();

    const userInDb = await prisma.user.findUnique({
      where: { email: VALID_SIGNUP.email },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb!.status).toBe(UserStatus.PENDING);
    expect(userInDb!.email).toBe(VALID_SIGNUP.email);
  });

  /********* EMAIL INVALID *********/

  it('should return 400 when email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: 'not-an-email', password: VALID_SIGNUP.password });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        DtoErrorCodeEnum.EMAIL_INVALID,
      ]),
    );

  });

  it('should return 400 when email is empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: '', password: VALID_SIGNUP.password });

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
    const response = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: VALID_SIGNUP.email, password: 'short' });

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
    await request(app.getHttpServer())
      .post('/auth/signUp')
      .send(VALID_SIGNUP);

    const response = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send(VALID_SIGNUP);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      success: false,
      statusCode: 409,
      message: ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR,
    });
  });
});
