import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/request/sign-up.dto';
import { SignInRequestDto } from './dto/request/sign-in.dto';
import { ForgotPasswordRequestDto } from './dto/request/forgot-password.dto';
import { ConfirmAccountRequestDto } from './dto/request/confirm-account.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.dto';
import { SignInResponseDto } from './dto/response/sign-in.dto';
import { UserResponseDto } from './dto/response/user.dto';

import { Public } from 'src/common/decorators/public.decorator';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/common/decorators/serialize.decorator';
import { LoginMethod } from '@prisma/client';
import { IAuthSession } from './types';
import { RequireTokenType } from 'src/common/decorators/require-token-type.decorator';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { GithubOauthGuard } from 'src/common/guards/github-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  IAuthenticatedRequest,
  IOAuthCallbackRequest,
} from 'src/common/types/request.types';

import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

// By default @RequireTokenType is TokenType.ACCESS

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }


  /***************************************** AUTHENTIFICATION ***************************************************************************************/




  @Public()
  @Post('signUp')
  @SerializeWith(UserResponseDto)
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<UserResponseDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('signIn')
  @SerializeWith(SignInResponseDto)
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(signInDto);
  }

  @RequireTokenType(TokenType.REFRESH)
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req: IAuthenticatedRequest): Promise<void> {
    await this.authService.logout(req.token!);
  }

  @RequireTokenType(TokenType.REFRESH)
  @HttpCode(201)
  @Post('refresh')
  @SerializeWith(SignInResponseDto)
  async refresh(@Req() req: IAuthenticatedRequest): Promise<SignInResponseDto> {

    return await this.authService.refresh(req.token!);
  }

  /********************************************** ACCOUNT MANAGEMENT *************************************************************/

  @Public()
  @Post('resendConfirmAccount')
  @SerializeWith(UserResponseDto)
  async reSendConfirmAccount(
    @Body() resendConfirmAccountDto: ForgotPasswordRequestDto,
  ): Promise<UserResponseDto> {
    return await this.authService.reSendConfirmAccount(
      resendConfirmAccountDto.email,
    );
  }

  @Public()
  @Patch('confirmAccount')
  @SkipSerialize()
  async confirmAccount(
    @Body() confirmAccountDto: ConfirmAccountRequestDto,
  ): Promise<void> {
    return await this.authService.confirmAccount(confirmAccountDto);
  }

  /************************************  PASSWORD ****************************************************/

  @Public()
  @Post('forgotPassword')
  @SerializeWith(UserResponseDto)
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordRequestDto,
  ): Promise<UserResponseDto> {
    return await this.authService.forgotPassword(forgotPasswordDTO.email);
  }

  @Public()
  @Patch('resetPassword')
  @SkipSerialize()
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<void> {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /************************************  GOOGLE ****************************************************/

  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @SkipSerialize()
  googleAuth() {
    // Redirection manage by Passport
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @SkipSerialize()
  async googleAuthCallback(
    @Req() req: IOAuthCallbackRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!req.user.oauthId)
        throw new BadRequestException(
          ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED,
        );

      const sessionId: string = uuidv4();
      const data: IAuthSession = await this.authService.signInOauth(
        req.user.oauthId,
        LoginMethod.GOOGLE,
      );
      await this.cacheManager.set(sessionId, { ...data });

      res.redirect(
        this.__buildOAuthRedirectUrl('success', {
          sessionId,
          loginMethod: LoginMethod.GOOGLE,
        }),
      );
    } catch (error: unknown) {
      res.redirect(
        this.__buildOAuthRedirectUrl('error', {
          errorCode: this.__getErrorCodeFromException(error),
        }),
      );
    }
  }

  /************************************  GITHUB ****************************************************/

  @Public()
  @Get('github')
  @UseGuards(GithubOauthGuard)
  @SkipSerialize()
  async githubAuth() {
    //
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  @SkipSerialize()
  async githubAuthCallback(
    @Req() req: IOAuthCallbackRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!req.user.oauthId)
        throw new BadRequestException(
          ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED,
        );

      const sessionId: string = uuidv4();
      const data: IAuthSession = await this.authService.signInOauth(
        req.user.oauthId,
        LoginMethod.GITHUB,
      );

    
      await this.cacheManager.set(sessionId, { ...data });
      res.redirect(
        this.__buildOAuthRedirectUrl('success', {
          sessionId,
          loginMethod: LoginMethod.GITHUB,
        }),
      );
    } catch (error: unknown) {
      res.redirect(
        this.__buildOAuthRedirectUrl('error', {
          errorCode: this.__getErrorCodeFromException(error),
        }),
      );
    }
  }

  /************************************  OAUTH ****************************************************/

  @Public()
  @Get('oauthSession/:id')
  @SerializeWith(SignInResponseDto)
  async getOauthSession(
    @Param('id') sessionId: string,
  ): Promise<SignInResponseDto> {
    const session: IAuthSession | undefined =
      await this.cacheManager.get(sessionId);

    if (!session)
      throw new UnauthorizedException(ErrorCodeEnum.OAUTH_LOGIN_FAILED);

    await this.cacheManager.del(sessionId);
    return session;
  }



  /************************************  PRIVATE METHOD ****************************************************/

  private __buildOAuthRedirectUrl(
    type: 'success' | 'error',
    params: { sessionId?: string; loginMethod?: LoginMethod; errorCode?: string },
  ): string {
    const baseUrl =
      type === 'success'
        ? this.configService.get('FRONT_URL_OAUTH_CALLBACK_SUCCESS')
        : this.configService.get('FRONT_URL_OAUTH_CALLBACK_ERROR');

    const searchParams = new URLSearchParams();

    if (type === 'success' && params.sessionId && params.loginMethod) {
      searchParams.set('sessionId', params.sessionId);
      searchParams.set('loginMethod', params.loginMethod);
    } else if (type === 'error' && params.errorCode) {
      searchParams.set('errorCode', params.errorCode);
    }

    return `${baseUrl}?${searchParams.toString()}`;
  }

  private __getErrorCodeFromException(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : '';
    return Object.values(ErrorCodeEnum).includes(errorMessage as ErrorCodeEnum)
      ? errorMessage
      : ErrorCodeEnum.INTERNAL_SERVER_ERROR;
  }
}
