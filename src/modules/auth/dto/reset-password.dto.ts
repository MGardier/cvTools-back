import { OmitType, PickType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto extends PickType(SignUpDto, ['password']) {
  @IsNotEmpty()
  @IsString()
  token: string;
}
