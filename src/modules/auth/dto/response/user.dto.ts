import { Expose } from 'class-transformer';
import { UserRoles, UserStatus } from '#prisma/generated/client.js';

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  status!: UserStatus;

  @Expose()
  roles!: UserRoles;
}
