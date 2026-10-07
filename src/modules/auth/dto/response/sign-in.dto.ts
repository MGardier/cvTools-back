import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user.dto.js';
import { TokenResponseDto } from './token.dto.js';

export class SignInResponseDto {
  @Expose()
  @Type(() => TokenResponseDto)
  tokens!: TokenResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}
