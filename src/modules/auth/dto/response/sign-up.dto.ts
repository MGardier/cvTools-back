import { UserStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SignUpResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
  
  @Expose()
  status: UserStatus
}
