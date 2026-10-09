import {
  BadRequestException,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { contract } from '@cvtools/contracts';
import { AuthService } from './auth.service.js';

import { Public } from '#shared/decorators/public.decorator.js';
import { SkipSerialize } from '#shared/decorators/serialize.decorator.js';
import { LoginMethod } from '#prisma/generated/client.js';
import { GoogleOauthGuard } from '#app/guards/google-oauth.guard.js';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';
import { GithubOauthGuard } from '#app/guards/github-oauth.guard.js';
import { CredentialsAuthGuard } from '#app/guards/credentials-auth.guard.js';
import { JwtRefreshGuard } from '#app/guards/jwt-refresh.guard.js';
import { ConfigService } from '@nestjs/config';
import { OAuth } from '#shared/utils/oauth.js';
import { ContractRoute } from '#shared/utils/contract-route.js';
import type { Response } from 'express';
import {
  IAuthenticatedRequest,
  IRefreshTokenRequest,
  IOAuthCallbackRequest,
  ISignInRequest,
} from '#shared/types/request.types.js';

// No prefix: contract routes carry their full path (@cvtools/contracts),
// OAuth redirect routes are prefixed manually.
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // =============================================================================
  //                            AUTHENTIFICATION
  // =============================================================================

  @Public()
  @Implement(contract.auth.signUp)
  signUp() {
    return implement(contract.auth.signUp).handler(async ({ input, context }) =>
      ContractRoute.buildSuccessResponse(
        contract.auth.signUp,
        await this.authService.signUp(input),
        context.request,
      ),
    );
  }

  @Public()
  @UseGuards(CredentialsAuthGuard)
  @Implement(contract.auth.signIn)
  signIn(
    @Req() req: ISignInRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return implement(contract.auth.signIn).handler(async ({ context }) => {
      const tokens = await this.authService.signIn(req.user);
      this.authService.setAuthCookies(res, tokens);
      return ContractRoute.buildSuccessResponse(
        contract.auth.signIn,
        req.user,
        context.request,
      );
    });
  }

  @Implement(contract.auth.me)
  me(@Req() req: IAuthenticatedRequest) {
    return implement(contract.auth.me).handler(async ({ context }) =>
      ContractRoute.buildSuccessResponse(
        contract.auth.me,
        await this.authService.getCurrentUser(req.user.sub),
        context.request,
      ),
    );
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Implement(contract.auth.logout)
  logout(
    @Req() req: IRefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return implement(contract.auth.logout).handler(async () => {
      await this.authService.logout(req.user.refreshToken);
      this.authService.clearAuthCookies(res);
    });
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Implement(contract.auth.refresh)
  refresh(
    @Req() req: IRefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return implement(contract.auth.refresh).handler(async ({ context }) => {
      const authSession = await this.authService.refresh(req.user.refreshToken);
      this.authService.setAuthCookies(res, authSession.tokens);
      return ContractRoute.buildSuccessResponse(
        contract.auth.refresh,
        authSession.user,
        context.request,
      );
    });
  }

  // =============================================================================
  //                          ACCOUNT MANAGEMENT
  // =============================================================================

  @Public()
  @Implement(contract.auth.resendConfirmAccount)
  reSendConfirmAccount() {
    return implement(contract.auth.resendConfirmAccount).handler(
      async ({ input, context }) =>
        ContractRoute.buildSuccessResponse(
          contract.auth.resendConfirmAccount,
          await this.authService.reSendConfirmAccount(input.email),
          context.request,
        ),
    );
  }

  @Public()
  @Implement(contract.auth.confirmAccount)
  confirmAccount() {
    return implement(contract.auth.confirmAccount).handler(
      async ({ input, context }) => {
        await this.authService.confirmAccount(input);
        return ContractRoute.buildSuccessResponse(
          contract.auth.confirmAccount,
          undefined,
          context.request,
        );
      },
    );
  }

  // =============================================================================
  //                               PASSWORD
  // =============================================================================

  @Public()
  @Implement(contract.auth.forgotPassword)
  forgotPassword() {
    return implement(contract.auth.forgotPassword).handler(
      async ({ input, context }) =>
        ContractRoute.buildSuccessResponse(
          contract.auth.forgotPassword,
          await this.authService.forgotPassword(input.email),
          context.request,
        ),
    );
  }

  @Public()
  @Implement(contract.auth.resetPassword)
  resetPassword() {
    return implement(contract.auth.resetPassword).handler(
      async ({ input, context }) => {
        await this.authService.resetPassword(input);
        return ContractRoute.buildSuccessResponse(
          contract.auth.resetPassword,
          undefined,
          context.request,
        );
      },
    );
  }

  // =============================================================================
  //                               GOOGLE
  // =============================================================================

  @Public()
  @Get('auth/google')
  @UseGuards(GoogleOauthGuard)
  @SkipSerialize()
  googleAuth() {
    // Redirection manage by Passport
  }

  @Public()
  @Get('auth/google/callback')
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
        OAuth.buildRedirectUrl(this.configService, 'success', {
          loginMethod: LoginMethod.GOOGLE,
        }),
      );
    } catch (error: unknown) {
      res.redirect(
        OAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: OAuth.resolveErrorCode(error),
        }),
      );
    }
  }

  // =============================================================================
  //                               GITHUB
  // =============================================================================

  @Public()
  @Get('auth/github')
  @UseGuards(GithubOauthGuard)
  @SkipSerialize()
  async githubAuth() {
    //
  }

  @Public()
  @Get('auth/github/callback')
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
        OAuth.buildRedirectUrl(this.configService, 'success', {
          loginMethod: LoginMethod.GITHUB,
        }),
      );
    } catch (error: unknown) {
      res.redirect(
        OAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: OAuth.resolveErrorCode(error),
        }),
      );
    }
  }
}
