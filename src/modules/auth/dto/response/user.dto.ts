import { Expose } from 'class-transformer';
import { UserRoles, UserStatus } from '@prisma/client';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  status: UserStatus;

  @Expose()
  roles: UserRoles;
}
