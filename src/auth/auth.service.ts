import {
  ConflictException,
  Injectable,

  NotFoundException,
  UnauthorizedException,

} from '@nestjs/common';


import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';


import { TokenType } from 'src/user-token/enum/token-type.enum';
import { LoginMethod, User, UserStatus } from '@prisma/client';
import { SignInDto } from './dto/sign-in.dto';
import { SignInOutputInterface } from './interfaces/sign-in.output.interface';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ErrorCodeEnum } from 'src/enums/error-codes.enum';
import { CompleteOauthDto } from './dto/complete-oauth.dto';


//Todo : rajouter les codes d'erreurs pour les messages 
//Todo : Oubli de suppression des anciens tokens


@Injectable()
export class AuthService {

  constructor(
    private readonly userTokenService: UserTokenService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {

  }


  /***************************************** AUTHENTIFICATION ***************************************************************************************/


  async signUp(data: SignUpDto, userSelectedColumn?: (keyof User)[]): Promise<Pick<User, "id" | 'email'>> {

    const hashedPassword = await this.__hashPassword(data.password);

    const user = await this.userService.create(
      {
        email: data.email,
        password: hashedPassword,
        loginMethod: LoginMethod.CLASSIC
      },
      userSelectedColumn
    );

    const userToken = await this.userTokenService.generateAndSave(
      { sub: user.id, email: user.email },
      TokenType.CONFIRM_ACCOUNT
    );

    await this.emailService.sendAccountConfirmationLink(
      user.email,
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}/${userToken.token}`,
    );

    return user;
  }


  async signIn(data: SignInDto, userSelectedColumn?: (keyof User)[]): Promise<SignInOutputInterface> {

    const user = await this.userService.findOneByEmail(data.email, userSelectedColumn);
    if (
      !user ||
      !user?.password ||
      !(await bcrypt.compare(data.password, user.password))
    )
      throw new UnauthorizedException('Invalid credentials');

    if (user.status === UserStatus.PENDING)
      throw new UnauthorizedException('User must be valid his account');

    if (user.status === UserStatus.BANNED)
      throw new UnauthorizedException('User is banned and cannot login ');

    const access = await this.userTokenService.generate({
      email: user.email!,
      sub: user.id!,
    },
      TokenType.ACCESS
    );

    const refresh = await this.userTokenService.generateAndSave(
      {
        email: user.email!,
        sub: user.id!,
      },
      TokenType.REFRESH,
      ['token']
    );

    const { password, ...responseUser } = user;


    return { tokens: { accessToken: access.token, refreshToken: refresh.token! }, user: responseUser as Omit<User, "password"> };
  }





  async logout(token: string): Promise<boolean> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      token,
      TokenType.REFRESH,
      ['id', 'token']
    );
    if (!userToken.id) throw new UnauthorizedException();

    const user = await this.userService.findOneById(+payload.sub, ['id']);
    if (!user) throw new UnauthorizedException();

    await this.userTokenService.remove(userToken.id);
    return true;
  }


  async refresh(token: string): Promise<SignInOutputInterface> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      token, TokenType.REFRESH,
    );

    if (!userToken.id || !userToken.token) throw new UnauthorizedException();

    const user = await this.userService.findOneById(+payload.sub);
    if (!user?.id || !user?.email || !user) throw new UnauthorizedException('User was not found');

    const newPayload = {
      sub: user.id,
      email: user.email
    }

    const accessToken = await this.userTokenService.generate(newPayload, TokenType.ACCESS);
    const refreshToken = await this.userTokenService.generateAndSave(newPayload, TokenType.REFRESH);

    await this.userTokenService.remove(userToken.id);
    const { password, ...responseUser } = user;
    return { tokens: { accessToken: accessToken.token, refreshToken: refreshToken.token! }, user: responseUser as Omit<User, "password"> };
  }

  /************************ ACCOUNT MANAGEMENT **********************************************************/



  async sendConfirmAccount(
    email: string,
    userSelectedColumn?: (keyof User)[]
  ): Promise<Pick<User, "id" | "email" | "status">> {

    const user = await this.userService.findOneByEmail(email, userSelectedColumn);
    if (!user?.id || !user?.status)
      throw new NotFoundException();

    if (user.status !== UserStatus.PENDING)
      throw new UnauthorizedException();

    const userToken = await this.userTokenService.generateAndSave({ sub: user.id, email }, TokenType.CONFIRM_ACCOUNT);

    await this.emailService.sendAccountConfirmationLink(
      email,
      `${this.configService.get('FRONT_URL_CONFIRMATION_ACCOUNT')}?token=${userToken.token}`,
    );

    return user as Pick<User, "id" | "email" | "status">;
  }




  async confirmAccount(
    confirmAccountDto: ConfirmAccountDto,
    selectedColumn?: (keyof User)[]
  ): Promise<Boolean> {
    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      confirmAccountDto.token,
      TokenType.CONFIRM_ACCOUNT,
      ['id', 'token']
    );
    if (!userToken.id || !payload.sub)
      throw new NotFoundException(ErrorCodeEnum.TOKEN_EXPIRED);

    const user = await this.userService.update(payload.sub, {
      status: UserStatus.ALLOWED,
    }, selectedColumn);

    await this.userTokenService.remove(userToken.id);
    return true;

  }

  async forgotPassword(email: string): Promise<Boolean> {
    const user = await this.userService.findOneByEmail(email, ['id', 'email']);

    if (user) {
      const userToken = await this.userTokenService.generateAndSave(
        {
          email: user.email!,
          sub: user.id!,
        },
        TokenType.FORGOT_PASSWORD,
      );

      await this.emailService.sendResetPasswordLink(
        user.email!,
        `${this.configService.get('FRONT_URL_RESET_PASSWORD')}?token=${userToken.token}`,
      );
    }

    return true;
  }

  async resetPassword(data: ResetPasswordDto): Promise<Boolean> {

    const { userToken, payload } = await this.userTokenService.decodeAndGet(
      data.token,
      TokenType.FORGOT_PASSWORD,
      ['id', 'token']
    );

    if (!userToken.id) throw new NotFoundException();

    const hashedPassword = await this.__hashPassword(data.password);

    const user = await this.userService.update(payload.sub, {
      password: hashedPassword,
    }, ['id']);

    if (!user) throw new NotFoundException('User was not found ');

    await this.userTokenService.remove(userToken.id);
    return true;
  }



  /********************************************* GOOGLE METHOD *********************************************************************************************** */


  async validateOrCreateGoogleUser(googleId: string, googleEmail: string) {

    const existingUser = await this.userService.findOneByOauthId({ oauthId: googleId, loginMethod: LoginMethod.GOOGLE },['id', 'email','status','oauthId'])

    if(existingUser)
      return existingUser;

     const existingEmailUser = await this.userService.findOneByEmail(googleEmail);
  
     if(existingEmailUser){
      if (existingEmailUser?.password)
        throw new ConflictException(ErrorCodeEnum.CLASSIC_ACCOUNT_ALREADY_EXISTS_ERROR)
      if (existingEmailUser?.loginMethod !== LoginMethod.GOOGLE)
        throw new ConflictException(ErrorCodeEnum.OAUTH_ACCOUNT_ALREADY_EXISTS_ERROR)


       return await this.userService.update(existingEmailUser.id!,{
        email: googleEmail,
        loginMethod: LoginMethod.GOOGLE,
        oauthId: googleId
      }, ['id', 'email','status','oauthId'])

     }

      return await this.userService.create({
        email: googleEmail,
        loginMethod: LoginMethod.GOOGLE,
        oauthId: googleId
      }, ['id', 'email','status','oauthId'])
      

  }

  /********************************************* GITHUB METHOD *********************************************************************************************** */



  async validateOrCreateGithubUser(githubId: string, githubEmail: string) {

    const existingUser = await this.userService.findOneByOauthId({ oauthId: githubId, loginMethod: LoginMethod.GITHUB },['id', 'email','status','oauthId'])

    if(existingUser)
      return existingUser;

     const existingEmailUser = await this.userService.findOneByEmail(githubEmail);
  
     if(existingEmailUser){
      if (existingEmailUser?.password)
        throw new ConflictException(ErrorCodeEnum.CLASSIC_ACCOUNT_ALREADY_EXISTS_ERROR)
      if (existingEmailUser?.loginMethod !== LoginMethod.GITHUB)
        throw new ConflictException(ErrorCodeEnum.OAUTH_ACCOUNT_ALREADY_EXISTS_ERROR)


       return await this.userService.update(existingEmailUser.id!,{
        email: githubEmail,
        loginMethod: LoginMethod.GITHUB,
        oauthId: githubId
      }, ['id', 'email','status','oauthId'])

  
     }


      return await this.userService.create({
        email: githubEmail,
        loginMethod: LoginMethod.GITHUB,
        oauthId: githubId
      }, ['id', 'email','status','oauthId'])
      

  }

  /********************************************* OAUTH METHOD *********************************************************************************************** */

  async completeOauth (completeOauthDto: CompleteOauthDto,selectedColumn?: (keyof User)[]): Promise<SignInOutputInterface>{

    const user = await this.userService.findOneByOauthId(completeOauthDto,['id', 'email','status','oauthId','roles','loginMethod']) as Omit<User,"password" | "createdAt"|"updatedAt">

    if(!user)
      throw new UnauthorizedException(ErrorCodeEnum.USER_NOT_FOUND_ERROR);

     const access = await this.userTokenService.generate({
      email: user.email!,
      sub: user.id!,
    },
      TokenType.ACCESS
    );

    const refresh = await this.userTokenService.generateAndSave(
      {
        email: user.email!,
        sub: user.id!,
      },
      TokenType.REFRESH,
      ['token']
    );

    return { tokens: { accessToken: access.token, refreshToken: refresh.token! } ,user};
  }


  /********************************************* PRIVATE METHOD *********************************************************************************************** */

  private async __hashPassword(password: string) {
    const saltRound = Number(this.configService.get('HASH_SALT_ROUND')) || 12;
    return await bcrypt.hash(password, saltRound);

  }

}
