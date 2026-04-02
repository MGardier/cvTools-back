import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LoginMethod, User, UserRoles, UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { UtilHash } from 'src/shared/utils/hash.util';




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


// =============================================================================
//                           DESCRIBE
// =============================================================================

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;


  const mockUserService = {
    findOneByEmail: jest.fn()
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
          useValue: {},
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

    jest.clearAllMocks();
  });

  // =============================================================================
  //                            VALIDATE USER
  // =============================================================================

  describe('validateUser', () => {

    it('should return the user when credentials are valid', async () => {
      userService.findOneByEmail.mockResolvedValue(makeUser());
      jest.spyOn(UtilHash, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@test.com',
        'password',
      );

      expect(result).toEqual(makeUser());
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
});
