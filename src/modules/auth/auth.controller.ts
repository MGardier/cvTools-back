import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/request/sign-up.dto';
import { ForgotPasswordRequestDto } from './dto/request/forgot-password.dto';
import { ConfirmAccountRequestDto } from './dto/request/confirm-account.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.dto';
import { UserResponseDto } from './dto/response/user.dto';

import { Public } from 'src/shared/decorators/public.decorator';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { LoginMethod } from '@prisma/client';
import { GoogleOauthGuard } from 'src/shared/guards/google-oauth.guard';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { GithubOauthGuard } from 'src/shared/guards/github-oauth.guard';
import { CredentialsAuthGuard } from 'src/shared/guards/credentials-auth.guard';
import { JwtRefreshGuard } from 'src/shared/guards/jwt-refresh.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  IAuthenticatedRequest,
  IRefreshTokenRequest,
  IOAuthCallbackRequest,
  ISignInRequest,
} from 'src/shared/types/request.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /***************************************** AUTHENTIFICATION ***************************************************************************************/

  @Public()
  @Post('signUp')
  @SerializeWith(UserResponseDto)
  async signUp(@Body() signUpDto: SignUpRequestDto): Promise<UserResponseDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('signIn')
  @UseGuards(CredentialsAuthGuard)
  @SerializeWith(UserResponseDto)
  async signIn(
    @Req() req: ISignInRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const tokens = await this.authService.signIn(req.user);
    this.authService.setAuthCookies(res, tokens);
    return req.user;
  }

  @Get('me')
  @SerializeWith(UserResponseDto)
  async me(@Req() req: IAuthenticatedRequest): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(req.user.sub);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Delete('logout')
  @HttpCode(204)
  @SkipSerialize()
  async logout(
    @Req() req: IRefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.refreshToken);

    this.authService.clearAuthCookies(res);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(201)
  @Post('refresh')
  @SerializeWith(UserResponseDto)
  async refresh(
    @Req() req: IRefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const authSession = await this.authService.refresh(req.user.refreshToken);
    this.authService.setAuthCookies(res, authSession.tokens);
    return authSession.user;
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

      const authSession = await this.authService.signInOauth(
        req.user.oauthId,
        LoginMethod.GOOGLE,
      );

      this.authService.setAuthCookies(res, authSession.tokens);

      res.redirect(
        this.__buildOAuthRedirectUrl('success', {
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

      const authSession = await this.authService.signInOauth(
        req.user.oauthId,
        LoginMethod.GITHUB,
      );

      this.authService.setAuthCookies(res, authSession.tokens);

      res.redirect(
        this.__buildOAuthRedirectUrl('success', {
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

  /************************************  PRIVATE METHOD ****************************************************/

  private __buildOAuthRedirectUrl(
    type: 'success' | 'error',
    params: { loginMethod?: LoginMethod; errorCode?: string },
  ): string {
    const baseUrl =
      type === 'success'
        ? this.configService.get('FRONT_URL_OAUTH_CALLBACK_SUCCESS')
        : this.configService.get('FRONT_URL_OAUTH_CALLBACK_ERROR');

    const searchParams = new URLSearchParams();

    if (type === 'success' && params.loginMethod) {
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
