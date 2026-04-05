import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtManagerService } from './jwt-manager.service';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { IPayloadJwt } from './types';


// =============================================================================
//                            MOCK DATA
// =============================================================================

const mockPayload: IPayloadJwt = { sub: 1, email: 'test@test.com' };

const mockConfigValues: Record<string, string | number> = {
  JWT_DEFAULT_SECRET: 'default-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_FORGOT_PASSWORD_SECRET: 'forgot-password-secret',
  JWT_ACCESS_EXPIRATION: 900,
  JWT_REFRESH_EXPIRATION: 604800,
  JWT_FORGOT_PASSWORD_EXPIRATION: 3600,
  JWT_CONFIRMATION_ACCOUNT_EXPIRATION: 86400,
};


// =============================================================================
//                           DESCRIBE
// =============================================================================

describe('JwtManagerService', () => {
  let jwtManagerService: JwtManagerService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtManagerService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed_token'),
            verifyAsync: jest.fn().mockResolvedValue(mockPayload),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfigValues[key]),
          },
        },
      ],
    }).compile();

    jwtManagerService = module.get<JwtManagerService>(JwtManagerService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => mockConfigValues[key] as any);
  });

  // =============================================================================
  //                            GENERATE
  // =============================================================================

  describe('generate', () => {
    it('should call signAsync with REFRESH secret and expiration', async () => {
      const result = await jwtManagerService.generate(mockPayload, TokenType.REFRESH);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'refresh-secret',
        expiresIn: 604800,
      });
      expect(result).toEqual({ token: 'signed_token', expiresIn: 604800 });
    });

    it('should call signAsync with FORGOT_PASSWORD secret and expiration', async () => {
      const result = await jwtManagerService.generate(mockPayload, TokenType.FORGOT_PASSWORD);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'forgot-password-secret',
        expiresIn: 3600,
      });
      expect(result).toEqual({ token: 'signed_token', expiresIn: 3600 });
    });

    it('should call signAsync with CONFIRM_ACCOUNT secret (default) and expiration', async () => {
      const result = await jwtManagerService.generate(mockPayload, TokenType.CONFIRM_ACCOUNT);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'default-secret',
        expiresIn: 86400,
      });
      expect(result).toEqual({ token: 'signed_token', expiresIn: 86400 });
    });

    it('should call signAsync with default secret and ACCESS expiration for ACCESS type', async () => {
      const result = await jwtManagerService.generate(mockPayload, TokenType.ACCESS);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'default-secret',
        expiresIn: 900,
      });
      expect(result).toEqual({ token: 'signed_token', expiresIn: 900 });
    });
  });

  // =============================================================================
  //                            VERIFY
  // =============================================================================

  describe('verify', () => {
    it('should call verifyAsync with the correct secret for REFRESH type', async () => {
      const result = await jwtManagerService.verify('some_token', TokenType.REFRESH);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('some_token', {
        secret: 'refresh-secret',
      });
      expect(result).toEqual(mockPayload);
    });
  });
});
