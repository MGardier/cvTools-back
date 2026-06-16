import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { LoginMethod } from '@prisma/client';

import { AdminService } from './admin.service';
import { AdminInvitationService } from '../admin-invitation/admin-invitation.service';
import { AuthService } from '../auth/auth.service';
import { RegisterAdminRequestDto } from './dto/request/register-admin.dto';
import { ValidateInvitationResponseDto } from '../admin-invitation/dto/response/validate-invitation.dto';
import { UserResponseDto } from '../auth/dto/response/user.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { CustomThrottlerGuard } from 'src/shared/guards/custom-throttler.guard';
import { ADMIN_THROTTLE } from './constants';
import { GoogleAdminOauthGuard } from 'src/shared/guards/google-admin-oauth.guard';
import { GithubAdminOauthGuard } from 'src/shared/guards/github-admin-oauth.guard';
import { IAdminOAuthCallbackRequest } from 'src/shared/types/request.types';
import { UtilOAuth } from 'src/shared/utils/oauth.util';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Controller('auth/admin')
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
  @Get('invitation/validate')
  @SerializeWith(ValidateInvitationResponseDto)
  async validateInvitation(
    @Query('token') token: string,
  ): Promise<ValidateInvitationResponseDto> {
    return this.adminInvitationService.validateInvitation(token);
  }

  // =============================================================================
  //                               REGISTER (PASSWORD)
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard)
  @Throttle(ADMIN_THROTTLE)
  @Post('register')
  @SerializeWith(UserResponseDto)
  async register(
    @Body() dto: RegisterAdminRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const session = await this.adminService.registerWithPassword(
      dto.token,
      dto.password,
    );

    this.authService.setAuthCookies(res, session.tokens);

    return session.user;
  }

  // =============================================================================
  //                               REGISTER (GOOGLE)
  // =============================================================================

  @Public()
  @UseGuards(CustomThrottlerGuard, GoogleAdminOauthGuard)
  @Throttle(ADMIN_THROTTLE)
  @Get('oauth/google')
  @SkipSerialize()
  googleAuth() {
    // Redirection to Google is handled by Passport (guard).
  }

  @Public()
  @Get('oauth/google/callback')
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
  @Get('oauth/github')
  @SkipSerialize()
  githubAuth() {
    // Redirection to GitHub is handled by Passport (guard).
  }

  @Public()
  @Get('oauth/github/callback')
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
    loginMethod: LoginMethod,
  ): Promise<void> {
    const token = req.session.adminInvitationToken;

    if (!token) {
      res.redirect(
        UtilOAuth.buildRedirectUrl(this.configService, 'error', {
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
        UtilOAuth.buildRedirectUrl(this.configService, 'success', {
          loginMethod,
        }),
      );
    } catch (error: unknown) {
      res.redirect(
        UtilOAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: UtilOAuth.resolveErrorCode(error),
        }),
      );
    }
  }
}
