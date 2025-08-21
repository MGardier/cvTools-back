import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  Req,
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



//TODO : void to boolean 
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
    @Req() request: Request,
  ): Promise<boolean> {
    const token = request['token'];
    return await this.authService.logout(token);
    ;
  }

  @Token_Type(TokenType.REFRESH)
  @HttpCode(201)
  @Post('refresh')
  async refresh(@Req() request: Request) : Promise<SignInOutputInterface> {
    const token = request['token'];
    return await this.authService.refresh(token);
  }

  /* ----------  ACCOUNT MANAGEMENT ------------------------------------------------------- */

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
}
