import { Expose } from 'class-transformer';

export class ForgotPasswordResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
