import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginMethod, User, UserRoles, UserStatus } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from 'src/modules/email/email.service';
import { IAuthCookies, ITestCredentials } from './types';


// =============================================================================
//                               DEFAULT DATA
// =============================================================================

export const DEFAULT_CREDENTIALS: ITestCredentials = {
  email: 'email@example.com',
  password: 'StrongPassword1!',
};


// =============================================================================
//                             COOKIES HELPER
// =============================================================================

export function extractCookies(
  response: request.Response,
): Record<string, string> {
  const cookies: Record<string, string> = {};
  const setCookieHeaders = response.headers['set-cookie'] as unknown as
    | string[]
    | undefined;

  if (!setCookieHeaders) return cookies;

  for (const cookie of setCookieHeaders) {
    const [nameValue] = cookie.split(';');
    const [name, ...valueParts] = nameValue.split('=');
    cookies[name.trim()] = valueParts.join('=').trim();
  }

  return cookies;
}

export function parseAuthCookies(response: request.Response): IAuthCookies {
  const cookies = extractCookies(response);
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .filter((c) => c !== '=');

  return {
    accessToken: cookies['access_token'] || '',
    refreshToken: cookies['refresh_token'] || '',
    raw: cookieHeader,
  };
}

// =============================================================================
//                               USER HELPERS
// =============================================================================

export async function signUpUser(
  app: INestApplication,
  overrides: Partial<ITestCredentials> = {},
): Promise<request.Response> {
  const credentials = { ...DEFAULT_CREDENTIALS, ...overrides };
  return request(app.getHttpServer())
    .post('/auth/signUp')
    .send(credentials);
}

export async function createConfirmedUser(
  app: INestApplication,
  prisma: PrismaService,
  overrides: Partial<ITestCredentials> = {},
): Promise<request.Response> {
  const response = await signUpUser(app, overrides);
  const userId = response.body.data.id;
  await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ALLOWED },
  });
  return response;
}

// =============================================================================
//                               AUTH HELPERS
// =============================================================================

export async function signInUser(
  app: INestApplication,
  credentials: ITestCredentials = DEFAULT_CREDENTIALS,
): Promise<{ response: request.Response; cookies: IAuthCookies }> {
  const response = await request(app.getHttpServer())
    .post('/auth/signIn')
    .send(credentials);

  return { response, cookies: parseAuthCookies(response) };
}

export async function authenticateUser(
  app: INestApplication,
  prisma: PrismaService,
  overrides: Partial<ITestCredentials> = {},
): Promise<{ cookies: IAuthCookies; credentials: ITestCredentials }> {
  const credentials = { ...DEFAULT_CREDENTIALS, ...overrides };
  await createConfirmedUser(app, prisma, overrides);
  const { cookies } = await signInUser(app, credentials);
  return { cookies, credentials };
}

// =============================================================================
//                               EMAIL MOCK HELPERS
// =============================================================================

export function getEmailMock(app: INestApplication): jest.Mocked<EmailService> {
  return app.get(EmailService) as jest.Mocked<EmailService>;
}

export function extractTokenFromMockUrl(
  mockFn: jest.Mock,
  callIndex = 0,
): string {
  const calls = mockFn.mock.calls;
  if (!calls[callIndex]) throw new Error(`No mock call at index ${callIndex}`);

  const url = calls[callIndex][2] as string;
  const tokenMatch = url.match(/[?&]token=([^&]+)/);
  if (!tokenMatch) throw new Error(`No token found in URL: ${url}`);

  return tokenMatch[1];
}


// =============================================================================
//                            OAUTH HELPERS
// =============================================================================

export async function createOAuthUser(
  prisma: PrismaService,
  loginMethod: LoginMethod,
  overrides: { email?: string; oauthId?: string; status?: UserStatus } = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `oauth-${loginMethod.toLowerCase()}@example.com`,
      oauthId: overrides.oauthId ?? `${loginMethod.toLowerCase()}-oauth-id-123`,
      loginMethod,
      status: overrides.status ?? UserStatus.ALLOWED,
      roles: UserRoles.USER,
    },
  });
}
