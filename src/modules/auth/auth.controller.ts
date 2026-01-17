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
import { SignUpResponseDto } from './dto/response/sign-up.dto';
import { SignInResponseDto } from './dto/response/sign-in.dto';

import { Public } from 'src/common/decorators/public.decorator';
import { SerializeWith, SkipSerialize } from 'src/common/decorators/serialize.decorator';
import { LoginMethod } from '@prisma/client';
import { IAuthSession, TUserAccountStatus } from './types';
import { RequireTokenType } from 'src/common/decorators/require-token-type.decorator';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { GithubOauthGuard } from 'src/common/guards/github-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';


//By default @RequireTokenType is TokenType.ACCESS

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

  ) { }

  /***************************************** AUTHENTIFICATION ***************************************************************************************/

  @Public()
  @Post('signUp')
  @SerializeWith(SignUpResponseDto)
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
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
  @SkipSerialize()
  async logout(
    @Req() req: Request,
  ): Promise<boolean> {
    const token = req['token'];
    return await this.authService.logout(token);
  }

  @RequireTokenType(TokenType.REFRESH)
  @HttpCode(201)
  @Post('refresh')
  @SerializeWith(SignInResponseDto)
  async refresh(@Req() req: Request): Promise<SignInResponseDto> {
    const token = req['token'];
    return await this.authService.refresh(token);
  }

  /********************************************** ACCOUNT MANAGEMENT *************************************************************/

  @Public()
  @Post('sendConfirmAccount')
  @SkipSerialize()
  async sendConfirmAccount(
    @Body() sendConfirmAccountDto: ForgotPasswordRequestDto,
  ): Promise<TUserAccountStatus> {
    return await this.authService.sendConfirmAccount(sendConfirmAccountDto.email);
  }


  @Public()
  @Patch('confirmAccount')
  @SkipSerialize()
  async confirmAccount(
    @Body() confirmAccountDto: ConfirmAccountRequestDto,
  ): Promise<Boolean> {
    return await this.authService.confirmAccount(confirmAccountDto);
  }


  /************************************  PASSWORD ****************************************************/

  @Public()
  @Post('forgotPassword')
  @SkipSerialize()
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordRequestDto,
  ): Promise<Boolean> {
    return await this.authService.forgotPassword(forgotPasswordDTO.email);
  }

  @Public()
  @Patch('resetPassword')
  @SkipSerialize()
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<Boolean> {
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
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      if (!req.user.oauthId)
        throw new BadRequestException(ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED)
      const sessionId: string = uuidv4();


      const data: IAuthSession = await this.authService.signInOauth(req.user.oauthId, LoginMethod.GOOGLE);

      await this.cacheManager.set(sessionId, {
        ...data
      })

      const redirectUrl = `${this.configService.get("FRONT_URL_OAUTH_CALLBACK_SUCCESS")}?sessionId=${encodeURIComponent(sessionId)}&loginMethod=${encodeURIComponent(LoginMethod.GOOGLE)}`;
      res.redirect(redirectUrl)

    }
    catch (error) {
      const errorCode = Object.values(ErrorCodeEnum).includes(error.message) ? error.message : ErrorCodeEnum.INTERNAL_SERVER_ERROR
      const redirectUrl = `${this.configService.get("FRONT_URL_OAUTH_CALLBACK_SUCCESS")}?error=${encodeURIComponent(errorCode)}`;
      res.redirect(redirectUrl);
    }
  }

  /************************************  GITHUB ****************************************************/

  @Public()
  @Get("github")
  @UseGuards(GithubOauthGuard)
  @SkipSerialize()
  async githubAuth() {
    //
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  @SkipSerialize()
  async githubAuthCallback(@Req() req, @Res() res: Response) {

    try {
      if (!req.user.oauthId)
        throw new BadRequestException(ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED)
      const sessionId: string = uuidv4();

      const data: IAuthSession = await this.authService.signInOauth(req.user.oauthId, LoginMethod.GITHUB);

      await this.cacheManager.set(sessionId, {
        ...data
      })
      const redirectUrl = `${this.configService.get("FRONT_URL_OAUTH_CALLBACK_SUCCESS")}?sessionId=${encodeURIComponent(sessionId)}&loginMethod=${encodeURIComponent(LoginMethod.GITHUB)}`;
      res.redirect(redirectUrl)
    }
    catch (error) {
      const errorCode = Object.values(ErrorCodeEnum).includes(error.message) ? error.message : ErrorCodeEnum.INTERNAL_SERVER_ERROR
      const redirectUrl = `${this.configService.get("FRONT_URL_OAUTH_CALLBACK_ERROR")}?error=${encodeURIComponent(errorCode)}`;
      res.redirect(redirectUrl);
    }
  }

  /************************************  OAUTH ****************************************************/

  @Public()
  @Get('oauthSession/:id')
  @SerializeWith(SignInResponseDto)
  async getOauthSession(@Param('id') sessionId: string): Promise<SignInResponseDto> {
    const session: IAuthSession | undefined = await this.cacheManager.get(sessionId);
    if (!session)
      throw new UnauthorizedException(ErrorCodeEnum.OAUTH_LOGIN_FAILED)
    return session;
  }
}


