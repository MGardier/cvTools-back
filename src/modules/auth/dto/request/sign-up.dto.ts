import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

export class SignUpRequestDto {
  @IsEmail({}, { message: DtoErrorCodeEnum.EMAIL_INVALID })
  @IsNotEmpty({ message: DtoErrorCodeEnum.EMAIL_REQUIRED })
  email: string;

  @IsNotEmpty({ message: DtoErrorCodeEnum.PASSWORD_REQUIRED })
  @MinLength(8, { message: DtoErrorCodeEnum.PASSWORD_MIN_LENGTH })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: DtoErrorCodeEnum.PASSWORD_WEAK,
  })
  password: string;
}
