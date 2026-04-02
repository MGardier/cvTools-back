import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LoginMethod, PrismaTokenType, User, UserRoles, UserStatus, UserToken } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { UtilHash } from 'src/shared/utils/hash.util';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';




// =============================================================================
//                            MOCK DATA
// =============================================================================
const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test@test.com',
  password: 'hashed_password',
  oauthId: null,
  createdAt: new Date(),
  updatedAt: null,
  status: UserStatus.ALLOWED,
  roles: UserRoles.USER,
  loginMethod: LoginMethod.CLASSIC,
  ...overrides,
});

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


// =============================================================================
//                           DESCRIBE
// =============================================================================

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let userTokenService: jest.Mocked<UserTokenService>;


  const mockUserService = {
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
  }

  const mockUserTokenService = {
    decodeAndGet: jest.fn(),
    generate: jest.fn(),
    generateAndSave: jest.fn(),
    remove: jest.fn(),
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UserTokenService,
          useValue: mockUserTokenService,
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    userTokenService = module.get(UserTokenService);

    jest.clearAllMocks();
  });

  // =============================================================================
  //                            VALIDATE USER
  // =============================================================================

  describe('validateUser', () => {

    it('should return the user when credentials are valid', async () => {
      const user = makeUser();
      userService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(UtilHash, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@test.com',
        'password',
      );

      expect(result).toEqual(user);
      expect(userService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser('unknown@test.com', 'password'),
      ).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS),
      );
    });

    it('should throw UnauthorizedException when user has no password (OAuth account)',
      async () => {
      userService.findOneByEmail.mockResolvedValue(makeUser({
        password: null,
      }));

      await expect(
        authService.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userService.findOneByEmail.mockResolvedValue(makeUser());
      jest.spyOn(UtilHash, 'compare').mockResolvedValue(false);

      await expect(
        authService.validateUser('test@test.com', 'wrong_password'),
      ).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.INVALID_CREDENTIALS),
      );
    });

    it('should throw ForbiddenException when user status is PENDING', async () => {
      userService.findOneByEmail.mockResolvedValue(makeUser({
        status: UserStatus.PENDING,
      }));
      jest.spyOn(UtilHash, 'compare').mockResolvedValue(true);

      await expect(
        authService.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(
        new ForbiddenException(ErrorCodeEnum.ACCOUNT_PENDING),
      );
    });

    it('should throw ForbiddenException when user status is BANNED', async () => {
      userService.findOneByEmail.mockResolvedValue(makeUser({
        status: UserStatus.BANNED,
      }));
      jest.spyOn(UtilHash, 'compare').mockResolvedValue(true);

      await expect(
        authService.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(
        new ForbiddenException(ErrorCodeEnum.USER_BANNED),
      );
    });
  });

  // =============================================================================
  //                            REFRESH
  // =============================================================================

  describe('refresh', () => {
    const mockToken = 'valid_refresh_token';
    const mockAccessToken = 'new_access_token';
    const mockRefreshToken = 'new_refresh_token';
    const mockPayload = { sub: 1, email: 'test@test.com', uuid: 'uuid-123' };

    it('should return new tokens, user and remove old refresh token', async () => {
      const user = makeUser();
      const userToken = makeUserToken();
      const expectedPayload = { sub: user.id, email: user.email };

      userTokenService.decodeAndGet.mockResolvedValue({ userToken, payload: mockPayload });
      userService.findOneById.mockResolvedValue(user);
      userTokenService.generate.mockResolvedValue({ token: mockAccessToken, expiresIn: 900 });
      userTokenService.generateAndSave.mockResolvedValue(userToken);
      userTokenService.remove.mockResolvedValue(userToken);

      const result = await authService.refresh(mockToken);

      expect(result).toEqual({
        tokens: {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        },
        user,
      });

      expect(userTokenService.remove).toHaveBeenCalledWith(userToken.id);
    });

    it('should throw UnauthorizedException when userToken.id is unedefined', async () => {
      userTokenService.decodeAndGet.mockResolvedValue({
        userToken: makeUserToken({ id: null } as any ),
        payload: mockPayload,
      });

      await expect(authService.refresh(mockToken)).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID),
      );
    });

    it('should throw UnauthorizedException when userToken.token is undefined', async () => {
      userTokenService.decodeAndGet.mockResolvedValue({
        userToken: makeUserToken({  token: null } as any),
        payload: mockPayload,
      });

      await expect(authService.refresh(mockToken)).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID),
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userTokenService.decodeAndGet.mockResolvedValue({
        userToken: makeUserToken(),
        payload: mockPayload,
      });
      userService.findOneById.mockResolvedValue(null);

      await expect(authService.refresh(mockToken)).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.USER_NOT_FOUND_ERROR),
      );
    });
  });
});
