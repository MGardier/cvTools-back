import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaTokenType, UserToken } from 'prisma/generated/client';
import { UserTokenService } from './user-token.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { UserTokenRepository } from './user-token.repository';
import { ConfigService } from '@nestjs/config';
import { TokenType } from './enums/token-type.enum';
import { UtilHash } from 'src/shared/utils/hash.util';
import { UtilRepository } from 'src/shared/utils/repository.util';
import { UtilDate } from 'src/shared/utils/date.util';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { IPayloadJwt } from 'src/modules/jwt-manager/types';

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid-123'),
}));

// =============================================================================
//                            MOCK DATA
// =============================================================================

const makeUserToken = (overrides: Partial<UserToken> = {}): UserToken => ({
  id: 1,
  token: 'hashed_token',
  type: PrismaTokenType.REFRESH,
  uuid: 'uuid-123',
  expiresAt: new Date(),
  userId: 1,
  createdAt: new Date(),
  ...overrides,
});

const mockPayload: IPayloadJwt = { sub: 1, email: 'test@test.com' };

// =============================================================================
//                           DESCRIBE
// =============================================================================

describe('UserTokenService', () => {
  let userTokenService: UserTokenService;
  let jwtManagerService: Mocked<JwtManagerService>;
  let userTokenRepository: Mocked<UserTokenRepository>;
  let configService: Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTokenService,
        {
          provide: JwtManagerService,
          useValue: {
            generate: vi.fn(),
            verify: vi.fn(),
          },
        },
        {
          provide: UserTokenRepository,
          useValue: {
            create: vi.fn(),
            findByUuid: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    userTokenService = module.get<UserTokenService>(UserTokenService);
    jwtManagerService = module.get(JwtManagerService);
    userTokenRepository = module.get(UserTokenRepository);
    configService = module.get(ConfigService);

    vi.clearAllMocks();
  });

  // =============================================================================
  //                         GENERATE AND SAVE
  // =============================================================================

  describe('generateAndSave', () => {
    it('should generate with uuid in payload, hash the token, create with correct data and return the userToken', async () => {
      const rawToken = 'raw_jwt_token';
      const hashedToken = 'hashed_jwt_token';
      const expiresIn = 3600;
      const mockExpiresAt = new Date('2026-04-02T12:00:00Z');
      const mockUuid = 'mocked-uuid-123';
      const createdUserToken = makeUserToken({
        token: hashedToken,
        type: PrismaTokenType.CONFIRM_ACCOUNT,
      });

      jwtManagerService.generate.mockResolvedValue({
        token: rawToken,
        expiresIn,
      });
      configService.get.mockReturnValue(12);
      vi.spyOn(UtilHash, 'hash').mockResolvedValue(hashedToken);
      vi.spyOn(UtilDate, '__convertExpiresToDate').mockReturnValue(
        mockExpiresAt,
      );
      vi.spyOn(UtilRepository, 'toPrismaTokenType').mockReturnValue(
        PrismaTokenType.CONFIRM_ACCOUNT,
      );

      userTokenRepository.create.mockResolvedValue(createdUserToken);

      const result = await userTokenService.generateAndSave(
        mockPayload,
        TokenType.CONFIRM_ACCOUNT,
      );

      expect(jwtManagerService.generate).toHaveBeenCalledWith(
        {
          ...mockPayload,
          uuid: mockUuid,
        },
        TokenType.CONFIRM_ACCOUNT,
      );

      expect(UtilHash.hash).toHaveBeenCalledWith(rawToken, 12);

      expect(userTokenRepository.create).toHaveBeenCalledWith(
        {
          token: hashedToken,
          type: PrismaTokenType.CONFIRM_ACCOUNT,
          expiresAt: mockExpiresAt,
          uuid: mockUuid,
        },
        mockPayload.sub,
      );

      expect(result).toEqual({
        userToken: createdUserToken,
        rawToken: rawToken,
      });
    });
  });

  // =============================================================================
  //                         DECODE AND GET
  // =============================================================================

  describe('decodeAndGet', () => {
    const rawToken = 'raw_jwt_token';

    it('should decode, find by uuid, compare hash and return { userToken, payload }', async () => {
      const payloadWithUuid = { ...mockPayload, uuid: 'uuid-123' };
      const userToken = makeUserToken({ token: 'hashed_token' });

      jwtManagerService.verify.mockResolvedValue(payloadWithUuid);
      userTokenRepository.findByUuid.mockResolvedValue(userToken);
      vi.spyOn(UtilHash, 'compare').mockResolvedValue(true);

      const result = await userTokenService.decodeAndGet(
        rawToken,
        TokenType.REFRESH,
      );

      expect(jwtManagerService.verify).toHaveBeenCalledWith(
        rawToken,
        TokenType.REFRESH,
      );

      expect(userTokenRepository.findByUuid).toHaveBeenCalledWith('uuid-123');

      expect(UtilHash.compare).toHaveBeenCalledWith(rawToken, userToken.token);

      expect(result).toEqual({ userToken, payload: payloadWithUuid });
    });

    it('should throw UnauthorizedException when payload has no uuid', async () => {
      jwtManagerService.verify.mockResolvedValue({
        ...mockPayload,
        uuid: undefined,
      });

      await expect(
        userTokenService.decodeAndGet(rawToken, TokenType.REFRESH),
      ).rejects.toThrow(new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID));
    });

    it('should throw UnauthorizedException when token is not found by uuid', async () => {
      jwtManagerService.verify.mockResolvedValue({
        ...mockPayload,
        uuid: 'unknown-uuid',
      });
      userTokenRepository.findByUuid.mockResolvedValue(null);

      await expect(
        userTokenService.decodeAndGet(rawToken, TokenType.REFRESH),
      ).rejects.toThrow(new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID));
    });

    it('should throw UnauthorizedException when hash does not match', async () => {
      const payloadWithUuid = { ...mockPayload, uuid: 'uuid-123' };
      const userToken = makeUserToken();

      jwtManagerService.verify.mockResolvedValue(payloadWithUuid);
      userTokenRepository.findByUuid.mockResolvedValue(userToken);
      vi.spyOn(UtilHash, 'compare').mockResolvedValue(false);

      await expect(
        userTokenService.decodeAndGet(rawToken, TokenType.REFRESH),
      ).rejects.toThrow(new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID));
    });
  });
});
