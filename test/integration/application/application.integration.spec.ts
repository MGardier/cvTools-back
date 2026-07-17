import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApplicationStatus, Completeness, CreationMode } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { setupTestApp } from '../../setup/setup-test-app';
import { resetDatabase } from '../../setup/reset-database';
import { DEFAULT_CREDENTIALS, authenticateUser } from '../../setup/test-helper';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';
import { IAuthCookies } from '../../setup/types';

describe('Application Integration (CAND-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookies: IAuthCookies;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    jest.clearAllMocks();
    ({ cookies } = await authenticateUser(app, prisma));
  });

  afterAll(async () => {
    await app.close();
  });

  const postApplication = (payload: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/application')
      .set('Cookie', cookies.raw)
      .send(payload);

  // =============================================================================
  //                            QUICK CREATE (CAND-001)
  // =============================================================================

  describe('POST /application', () => {
    it.each([
      ['url', { url: 'https://example.com/job/42' }],
      ['company', { company: 'Anthropic' }],
      ['title', { title: 'Backend Developer' }],
      ['subject', { subject: 'Opportunité via meetup' }],
    ])('creates an application with only %s', async (_field, payload) => {
      const response = await postApplication(payload).expect(201);

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data).toMatchObject(payload);
    });

    it('applies the default values and links the authenticated user', async () => {
      const response = await postApplication({ company: 'Anthropic' }).expect(
        201,
      );

      const user = await prisma.user.findUnique({
        where: { email: DEFAULT_CREDENTIALS.email },
      });
      const created = await prisma.application.findUnique({
        where: { id: response.body.data.id as number },
      });

      expect(created).toMatchObject({
        currentStatus: ApplicationStatus.TO_PROCESS,
        completeness: Completeness.DRAFT,
        creationMode: CreationMode.MANUAL,
        isArchived: false,
        applicationType: null,
        userId: user!.id,
      });
      expect(created!.createdAt).toBeInstanceOf(Date);
    });

    it('rejects a payload without any identifying information', async () => {
      const response = await postApplication({}).expect(400);

      expect(JSON.stringify(response.body)).toContain(
        DtoErrorCodeEnum.AT_LEAST_ONE_OF_REQUIRED,
      );
      expect(await prisma.application.count()).toBe(0);
    });

    it('treats whitespace-only values as empty', async () => {
      const response = await postApplication({
        title: '   ',
        company: '  ',
        subject: '\t',
        url: '   ',
      }).expect(400);

      expect(JSON.stringify(response.body)).toContain(
        DtoErrorCodeEnum.AT_LEAST_ONE_OF_REQUIRED,
      );
      expect(await prisma.application.count()).toBe(0);
    });

    it('stores trimmed values', async () => {
      const response = await postApplication({
        title: '  Backend Developer  ',
      }).expect(201);

      const created = await prisma.application.findUnique({
        where: { id: response.body.data.id as number },
      });

      expect(created!.title).toBe('Backend Developer');
    });

    it('rejects an invalid URL and persists nothing', async () => {
      const response = await postApplication({
        url: 'not-a-valid-url',
        company: 'Anthropic',
      }).expect(400);

      expect(JSON.stringify(response.body)).toContain(
        DtoErrorCodeEnum.APPLICATION_URL_INVALID,
      );
      expect(await prisma.application.count()).toBe(0);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post('/application')
        .send({ company: 'Anthropic' })
        .expect(401);

      expect(await prisma.application.count()).toBe(0);
    });
  });

  // =============================================================================
  //                            ACCESS AFTER CREATION
  // =============================================================================

  describe('GET /application/:id', () => {
    it('gives direct access to the created application', async () => {
      const created = await postApplication({ company: 'Anthropic' }).expect(
        201,
      );

      const response = await request(app.getHttpServer())
        .get(`/application/${created.body.data.id}`)
        .set('Cookie', cookies.raw)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: created.body.data.id as number,
        company: 'Anthropic',
        currentStatus: ApplicationStatus.TO_PROCESS,
        completeness: Completeness.DRAFT,
      });
    });

    it('is not accessible by another user', async () => {
      const created = await postApplication({ company: 'Anthropic' }).expect(
        201,
      );

      const { cookies: otherCookies } = await authenticateUser(app, prisma, {
        email: 'other@example.com',
      });

      await request(app.getHttpServer())
        .get(`/application/${created.body.data.id}`)
        .set('Cookie', otherCookies.raw)
        .expect(404);
    });
  });
});
