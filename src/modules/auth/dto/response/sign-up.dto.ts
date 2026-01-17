import { Expose } from 'class-transformer';

export class SignUpResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
