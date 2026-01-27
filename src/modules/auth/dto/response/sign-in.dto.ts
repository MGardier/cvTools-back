import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user.dto';
import { TokenResponseDto } from './token.dto';

export class SignInResponseDto {
  @Expose()
  @Type(() => TokenResponseDto)
  tokens: TokenResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
