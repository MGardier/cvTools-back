import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
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
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;


  const mockUserService = {
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
    findOneByOauthId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
          useValue: {
            sendAccountConfirmationLink: jest.fn(),
          },
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
    emailService = module.get(EmailService);
    configService = module.get(ConfigService);

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


      userTokenService.decodeAndGet.mockResolvedValue({ userToken, payload: mockPayload });
      userService.findOneById.mockResolvedValue(user);
      userTokenService.generate.mockResolvedValue({ token: mockAccessToken, expiresIn: 900 });
      const refreshUserToken = makeUserToken({ token: mockRefreshToken });
      userTokenService.generateAndSave.mockResolvedValue(refreshUserToken);
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
        userToken: makeUserToken({ id: null } as any),
        payload: mockPayload,
      });

      await expect(authService.refresh(mockToken)).rejects.toThrow(
        new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID),
      );
    });

    it('should throw UnauthorizedException when userToken.token is undefined', async () => {
      userTokenService.decodeAndGet.mockResolvedValue({
        userToken: makeUserToken({ token: null } as any),
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

  // =============================================================================
  //                     VALIDATE OR CREATE GOOGLE USER
  // =============================================================================

  describe('validateOrCreateGoogleUser', () => {
    const googleId = 'google-oauth-id-123';
    const googleEmail = 'google@test.com';

    it('should return existing user found by oauthId without calling findOneByEmail', async () => {
      const user = makeUser({ oauthId: googleId, loginMethod: LoginMethod.GOOGLE });
      userService.findOneByOauthId.mockResolvedValue(user);

      const result = await authService.validateOrCreateGoogleUser(googleId, googleEmail);

      expect(result).toEqual(user);
      expect(userService.findOneByOauthId).toHaveBeenCalledWith({
        oauthId: googleId,
        loginMethod: LoginMethod.GOOGLE,
      });
      expect(userService.findOneByEmail).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists with a password (classic account)', async () => {
      userService.findOneByOauthId.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue(
        makeUser({ password: 'hashed_password' }),
      );

      await expect(
        authService.validateOrCreateGoogleUser(googleId, googleEmail),
      ).rejects.toThrow(
        new ConflictException(ErrorCodeEnum.CLASSIC_ACCOUNT_ALREADY_EXISTS_ERROR),
      );
    });

    it('should throw ConflictException when email exists with a different OAuth login method', async () => {
      userService.findOneByOauthId.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue(
        makeUser({ password: null, loginMethod: LoginMethod.GITHUB }),
      );

      await expect(
        authService.validateOrCreateGoogleUser(googleId, googleEmail),
      ).rejects.toThrow(
        new ConflictException(ErrorCodeEnum.OAUTH_ACCOUNT_ALREADY_EXISTS_ERROR),
      );
    });

    it('should update and return user when email exists without password and loginMethod is GOOGLE', async () => {
      const existingUser = makeUser({ password: null, loginMethod: LoginMethod.GOOGLE });
      const updatedUser = makeUser({
        oauthId: googleId,
        loginMethod: LoginMethod.GOOGLE,
        status: UserStatus.ALLOWED,
      });

      userService.findOneByOauthId.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue(existingUser);
      userService.update.mockResolvedValue(updatedUser);

      const result = await authService.validateOrCreateGoogleUser(googleId, googleEmail);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(existingUser.id, {
        email: googleEmail,
        loginMethod: LoginMethod.GOOGLE,
        status: UserStatus.ALLOWED,
        oauthId: googleId,
      });
    });

    it('should create and return a new user when no user is found', async () => {
      const newUser = makeUser({
        oauthId: googleId,
        email: googleEmail,
        password: null,
        loginMethod: LoginMethod.GOOGLE,
        status: UserStatus.ALLOWED,
      });

      userService.findOneByOauthId.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(newUser);

      const result = await authService.validateOrCreateGoogleUser(googleId, googleEmail);

      expect(result).toEqual(newUser);
      expect(userService.create).toHaveBeenCalledWith({
        email: googleEmail,
        loginMethod: LoginMethod.GOOGLE,
        status: UserStatus.ALLOWED,
        oauthId: googleId,
      });
    });
  });

  // =============================================================================
  //                     VALIDATE OR CREATE GITHUB USER
  // =============================================================================

  describe('validateOrCreateGithubUser', () => {
    const githubId = 'github-oauth-id-456';
    const githubEmail = 'github@test.com';


    it('should create and return a new user when no user is found', async () => {
      const newUser = makeUser({
        oauthId: githubId,
        email: githubEmail,
        password: null,
        loginMethod: LoginMethod.GITHUB,
        status: UserStatus.ALLOWED,
      });

      userService.findOneByOauthId.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(newUser);

      const result = await authService.validateOrCreateGithubUser(githubId, githubEmail);

      expect(result).toEqual(newUser);
      expect(userService.create).toHaveBeenCalledWith({
        email: githubEmail,
        loginMethod: LoginMethod.GITHUB,
        status: UserStatus.ALLOWED,
        oauthId: githubId,
      });
    });
  });

  // =============================================================================
  //                            SIGN UP
  // =============================================================================

  describe('signUp', () => {
    const signUpDto = { email: 'new@test.com', password: 'PlainPassword1!' };
    const hashedPassword = 'hashed_password_result';
    const frontUrl = 'http://front.test/confirm';
    const confirmToken = 'confirm_token_value';

    it(`should hash password, create user with CLASSIC loginMethod, generate CONFIRM_ACCOUNT token 
      and build confirmation link`, async () => {
      const createdUser = makeUser({ email: signUpDto.email, password: hashedPassword });
      const userToken = makeUserToken({ token: confirmToken, type: PrismaTokenType.CONFIRM_ACCOUNT });

      jest.spyOn(UtilHash, 'hash').mockResolvedValue(hashedPassword);
      configService.get.mockReturnValue(frontUrl);
      userService.create.mockResolvedValue(createdUser);
      userTokenService.generateAndSave.mockResolvedValue(userToken);

     const result =  await authService.signUp(signUpDto);

    expect(result).toEqual(createdUser);

      expect(userService.create).toHaveBeenCalledWith({ 
          email: signUpDto.email, 
          password: hashedPassword, 
          loginMethod: LoginMethod.CLASSIC 
      });


      expect(userTokenService.generateAndSave).toHaveBeenCalledWith(
        { sub: createdUser.id, email: createdUser.email },
        TokenType.CONFIRM_ACCOUNT,
      );

      expect(emailService.sendAccountConfirmationLink).toHaveBeenCalledWith(
        createdUser.id,
        createdUser.email,
        `${frontUrl}?token=${confirmToken}`,
      );


    });
  });
});
