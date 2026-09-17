import type { MockInstance } from 'vitest';
import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'prisma/generated/client';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { PrismaErrorEnum } from 'src/shared/enums/prisma-error-codes.enum';
import { PrismaClientExceptionFilter } from './prisma-exception.filter';

// =============================================================================
//                            MOCK DATA
// =============================================================================

const makeUniqueError = (meta: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: PrismaErrorEnum.UniqueConstraintFailed,
    clientVersion: 'test',
    meta,
  });

const makeHost = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const request = { method: 'POST', url: '/auth/signUp', user: undefined };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
};

// =============================================================================
//                           DESCRIBE
// =============================================================================

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter;
  let loggerErrorSpy: MockInstance<Logger['error']>;

  beforeEach(() => {
    const configService = {
      get: vi.fn().mockReturnValue('json'),
    } as unknown as ConfigService;
    filter = new PrismaClientExceptionFilter(configService);
    loggerErrorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('unique constraint (P2002)', () => {
    it.each([
      ['legacy meta.target fields', { modelName: 'User', target: ['email'] }],
      [
        'legacy meta.target index',
        { modelName: 'User', target: 'user_email_key' },
      ],
      [
        'driver adapter constraint index',
        {
          modelName: 'User',
          driverAdapterError: {
            name: 'DriverAdapterError',
            cause: {
              kind: 'UniqueConstraintViolation',
              constraint: { index: 'user_email_key' },
            },
          },
        },
      ],
      [
        'driver adapter constraint fields',
        {
          modelName: 'User',
          driverAdapterError: {
            name: 'DriverAdapterError',
            cause: {
              kind: 'UniqueConstraintViolation',
              constraint: { fields: ['email'] },
            },
          },
        },
      ],
    ])('should return EMAIL_ALREADY_EXISTS_ERROR for %s', (_label, meta) => {
      const { host, response } = makeHost();

      filter.catch(makeUniqueError(meta), host);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          message: ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR,
        }),
      );
    });

    it('should return DEFAULT_ALREADY_EXISTS_ERROR for another constraint', () => {
      const { host, response } = makeHost();

      filter.catch(
        makeUniqueError({
          modelName: 'UserToken',
          driverAdapterError: {
            name: 'DriverAdapterError',
            cause: {
              kind: 'UniqueConstraintViolation',
              constraint: { index: 'user_token_uuid_key' },
            },
          },
        }),
        host,
      );

      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ErrorCodeEnum.DEFAULT_ALREADY_EXISTS_ERROR,
        }),
      );
    });

    it('should log the resolved driver adapter target', () => {
      const { host } = makeHost();

      filter.catch(
        makeUniqueError({
          modelName: 'User',
          driverAdapterError: {
            name: 'DriverAdapterError',
            cause: { constraint: { index: 'user_email_key' } },
          },
        }),
        host,
      );

      const logged = JSON.parse(loggerErrorSpy.mock.calls[0][0] as string) as {
        context: { target?: string };
      };
      expect(logged.context.target).toBe('user_email_key');
    });
  });
});
