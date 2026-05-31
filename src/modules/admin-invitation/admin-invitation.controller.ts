import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

import { AdminInvitationService } from './admin-invitation.service';
import { AuthService } from '../auth/auth.service';
import { RegisterAdminRequestDto } from './dto/request/register-admin.dto';
import { ValidateInvitationResponseDto } from './dto/response/validate-invitation.dto';
import { UserResponseDto } from '../auth/dto/response/user.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';
import { CustomThrottlerGuard } from 'src/shared/guards/custom-throttler.guard';

@Controller('auth/admin')
export class AdminInvitationController {
  constructor(
    private readonly adminInvitationService: AdminInvitationService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // ttl: 1 minute
  @Get('invitation/validate')
  @SerializeWith(ValidateInvitationResponseDto)
  async validateInvitation(
    @Query('token') token: string,
  ): Promise<ValidateInvitationResponseDto> {
    return this.adminInvitationService.validateInvitation(token);
  }

  @Public()
  @Post('register')
  @SerializeWith(UserResponseDto)
  async register(
    @Body() dto: RegisterAdminRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const session = await this.adminInvitationService.registerWithPassword(
      dto.token,
      dto.password,
    );

    this.authService.setAuthCookies(res, session.tokens);

    return session.user;
  }
}
