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
import { SignUpDto } from '../auth/dto/sign-up.dto';

import { Public } from '../decorators/public.decorator';
import { User } from '@prisma/client';
import { SignInDto } from './dto/sign-in.dto';
import { SignInOutputInterface } from './interfaces/sign-in.output.interface';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Token_Type } from 'src/decorators/token-type.decorator';
import { TokenType } from 'src/user-token/enum/token-type.enum';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { ErrorCodeEnum } from '../enums/error-codes.enum';




@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

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
  ): Promise<SignInOutputInterface> {
    return await this.authService.signIn(signInDto,['id', 'email', 'password', 'status', 'roles']);

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
  async refresh(@Req() req: Request) : Promise<SignInOutputInterface> {
    const token = req['token'];
    return await this.authService.refresh(token);
  }

  /********************************************** ACCOUNT MANAGEMENT *************************************************************/

  @Public()
  @Post('sendConfirmAccount')
  async sendConfirmAccount(
    @Body() sendConfirmAccountDto: ForgotPasswordDTO,
  ): Promise<Pick<User, "id" | "email" | "status">> {

    return await this.authService.sendConfirmAccount(sendConfirmAccountDto.email, ['id', 'email','status']);

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
  async googleAuthCallback(@Req() req) {
      if(!req.user.oauthId)
        throw new BadRequestException(ErrorCodeEnum.OAUTH_ID_MISSING_ERROR)
      return await this.authService.signInWithGoogleUser(req.user.oauthId);
   }
}
