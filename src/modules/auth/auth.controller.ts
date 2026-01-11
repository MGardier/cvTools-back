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
import { SignUpDto } from './dto/sign-up.dto';

import { Public } from 'src/common/decorators/public.decorator';
import { LoginMethod, User } from '@prisma/client';
import { SignInDto } from './dto/sign-in.dto';
import { ISignInOutput } from './types';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Token_Type } from 'src/common/decorators/token-type.decorator';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { GithubOauthGuard } from 'src/common/guards/github-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';




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
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<Pick<User, "id" | 'email'>> {

    return await this.authService.signUp(signUpDto, ["id", "email"]);
  }

  @Public()
  @Post('signIn')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<ISignInOutput> {
    return await this.authService.signIn(signInDto, ['id', 'email', 'password', 'status', 'roles']);

  }

  @Token_Type(TokenType.REFRESH)
  @Delete('logout')
  async logout(
    @Req() req: Request,
  ): Promise<boolean> {
    const token = req['token'];
    return await this.authService.logout(token);
    ;
  }

  @Token_Type(TokenType.REFRESH)
  @HttpCode(201)
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<ISignInOutput> {
    const token = req['token'];
    return await this.authService.refresh(token);
  }

  /********************************************** ACCOUNT MANAGEMENT *************************************************************/

  @Public()
  @Post('sendConfirmAccount')
  async sendConfirmAccount(
    @Body() sendConfirmAccountDto: ForgotPasswordDTO,
  ): Promise<Pick<User, "id" | "email" | "status">> {

    return await this.authService.sendConfirmAccount(sendConfirmAccountDto.email, ['id', 'email', 'status']);

  }


  @Public()
  @Patch('confirmAccount')
  async confirmAccount(
    @Body() confirmAccountDto: ConfirmAccountDto,
  ): Promise<Boolean> {
    return await this.authService.confirmAccount(confirmAccountDto);

  }


  /************************************  PASSWORD ****************************************************/

  @Public()
  @Post('forgotPassword')
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordDTO,
  ): Promise<Boolean> {
    return await this.authService.forgotPassword(forgotPasswordDTO.email);

  }

  @Public()
  @Patch('resetPassword')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<Boolean> {
    return await this.authService.resetPassword(resetPasswordDto);

  }

  /************************************  GOOGLE ****************************************************/


  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    // Redirection manage by Passport
  }



  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      if (!req.user.oauthId)
        throw new BadRequestException(ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED)
      const sessionId: string = uuidv4();


      const data: ISignInOutput = await this.authService.signInOauth(req.user.oauthId, LoginMethod.GOOGLE, ['id', 'email', 'status', 'oauthId', 'roles', 'loginMethod']);

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

  /************************************  GOOGLE ****************************************************/

  @Public()
  @Get("github")
  @UseGuards(GithubOauthGuard)
  async githubAuth() {
    //
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  async githubAuthCallback(@Req() req, @Res() res: Response) {

    try {
      if (!req.user.oauthId)
        throw new BadRequestException(ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED)
      const sessionId: string = uuidv4();

      const data: ISignInOutput = await this.authService.signInOauth(req.user.oauthId, LoginMethod.GITHUB, ['id', 'email', 'status', 'oauthId', 'roles', 'loginMethod']);

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
  async getOauthSession(@Param('id') sessionId: string): Promise<ISignInOutput> {
    const session: ISignInOutput | undefined = await this.cacheManager.get(sessionId);
    if (!session)
      throw new UnauthorizedException(ErrorCodeEnum.OAUTH_LOGIN_FAILED)
    return session;
  }
}


