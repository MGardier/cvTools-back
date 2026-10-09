import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Implement, implement } from '@orpc/nest';
import { contract, type TOAuthLoginMethod } from '@cvtools/contracts';
import { LoginMethod } from '#prisma/generated/client.js';
import { AdminService } from './admin.service.js';
import { AdminInvitationService } from './admin-invitation/admin-invitation.service.js';
import { AuthService } from '../auth/auth.service.js';
import { Public } from '#shared/decorators/public.decorator.js';
import { SkipSerialize } from '#shared/decorators/serialize.decorator.js';
import { CustomThrottlerGuard } from '#app/guards/custom-throttler.guard.js';
import { ADMIN_THROTTLE } from './constants.js';
import { GoogleAdminOauthGuard } from '#app/guards/google-admin-oauth.guard.js';
import { GithubAdminOauthGuard } from '#app/guards/github-admin-oauth.guard.js';
import { IAdminOAuthCallbackRequest } from '#shared/types/request.types.js';
import { OAuth } from '#shared/utils/oauth.js';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';
import { ContractRoute } from '#shared/utils/contract-route.js';

// No prefix: contract routes carry their full path (@cvtools/contracts),
// OAuth redirect routes are prefixed manually.
@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminInvitationService: AdminInvitationService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // =============================================================================
  //                               INVITATION
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard)
  @Throttle(ADMIN_THROTTLE)
  @Implement(contract.admin.validateInvitation)
  validateInvitation() {
    return implement(contract.admin.validateInvitation).handler(
      async ({ input, context }) =>
        ContractRoute.buildSuccessResponse(
          contract.admin.validateInvitation,
          // Missing token is rejected by the service (TOKEN_INVALID).
          await this.adminInvitationService.validateInvitation(
            input.token ?? '',
          ),
          context.request,
        ),
    );
  }

  // =============================================================================
  //                               REGISTER (PASSWORD)
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard)
  @Throttle(ADMIN_THROTTLE)
  @Implement(contract.admin.register)
  register(@Res({ passthrough: true }) res: Response) {
    return implement(contract.admin.register).handler(
      async ({ input, context }) => {
        const session = await this.adminService.registerWithPassword(
          input.token,
          input.password,
        );
        this.authService.setAuthCookies(res, session.tokens);
        return ContractRoute.buildSuccessResponse(
          contract.admin.register,
          session.user,
          context.request,
        );
      },
    );
  }

  // =============================================================================
  //                               REGISTER (GOOGLE)
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard, GoogleAdminOauthGuard)
  @Throttle(ADMIN_THROTTLE)
  @Get('auth/admin/oauth/google')
  @SkipSerialize()
  googleAuth() {
    // Redirection to Google is handled by Passport (guard).
  }

  @Public()
  @Get('auth/admin/oauth/google/callback')
  @UseGuards(GoogleAdminOauthGuard)
  @SkipSerialize()
  async googleCallback(
    @Req() req: IAdminOAuthCallbackRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.__handleOauthCallback(req, res, LoginMethod.GOOGLE);
  }

  // =============================================================================
  //                               REGISTER (GITHUB)
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard, GithubAdminOauthGuard)
  @Throttle(ADMIN_THROTTLE)
  @Get('auth/admin/oauth/github')
  @SkipSerialize()
  githubAuth() {
    // Redirection to GitHub is handled by Passport (guard).
  }

  @Public()
  @Get('auth/admin/oauth/github/callback')
  @UseGuards(GithubAdminOauthGuard)
  @SkipSerialize()
  async githubCallback(
    @Req() req: IAdminOAuthCallbackRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.__handleOauthCallback(req, res, LoginMethod.GITHUB);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __handleOauthCallback(
    req: IAdminOAuthCallbackRequest,
    res: Response,
    loginMethod: TOAuthLoginMethod,
  ): Promise<void> {
    const token = req.session.adminInvitationToken;

    if (!token) {
      res.redirect(
        OAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: ErrorCodeEnum.ADMIN_INVITATION_SESSION_LOST,
        }),
      );
      return;
    }

    // Single-use: drop the token from session before attempting registration.
    delete req.session.adminInvitationToken;

    try {
      const session = await this.adminService.registerWithOauth(
        token,
        req.user.oauthId,
        req.user.email,
        loginMethod,
      );

      this.authService.setAuthCookies(res, session.tokens);

      res.redirect(
        OAuth.buildRedirectUrl(this.configService, 'success', {
          loginMethod,
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
