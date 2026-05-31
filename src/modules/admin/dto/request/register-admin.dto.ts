import { IsNotEmpty, IsUUID, Matches, MinLength } from 'class-validator';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

// Classic (password) admin registration only.
// OAuth registration goes through the dedicated /auth/admin/oauth routes.
export class RegisterAdminRequestDto {
  @IsUUID()
  @IsNotEmpty()
  token!: string;

  @IsNotEmpty({ message: DtoErrorCodeEnum.PASSWORD_REQUIRED })
  @MinLength(8, { message: DtoErrorCodeEnum.PASSWORD_MIN_LENGTH })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: DtoErrorCodeEnum.PASSWORD_WEAK,
  })
  password!: string;
}
