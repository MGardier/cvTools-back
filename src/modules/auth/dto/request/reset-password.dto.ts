import { PickType } from '@nestjs/mapped-types';
import { SignUpRequestDto } from './sign-up.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequestDto extends PickType(SignUpRequestDto, ['password']) {
  @IsNotEmpty()
  @IsString()
  token: string;
}
