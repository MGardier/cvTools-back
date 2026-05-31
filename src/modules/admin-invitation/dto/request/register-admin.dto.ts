import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { LoginMethod } from '@prisma/client';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

export class RegisterAdminRequestDto {
  @IsUUID()
  @IsNotEmpty()
  token!: string;

  @IsEnum(LoginMethod)
  loginMethod!: LoginMethod;

  // Required only for the CLASSIC login method.
  @ValidateIf(
    (o: RegisterAdminRequestDto) => o.loginMethod === LoginMethod.CLASSIC,
  )
  @IsNotEmpty({ message: DtoErrorCodeEnum.PASSWORD_REQUIRED })
  @MinLength(8, { message: DtoErrorCodeEnum.PASSWORD_MIN_LENGTH })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: DtoErrorCodeEnum.PASSWORD_WEAK,
  })
  password?: string;

  // Required only for the OAuth login methods (GITHUB, GOOGLE).
  @ValidateIf(
    (o: RegisterAdminRequestDto) => o.loginMethod !== LoginMethod.CLASSIC,
  )
  @IsNotEmpty()
  @IsString()
  oauthId?: string;
}
