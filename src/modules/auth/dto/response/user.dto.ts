import { Expose } from 'class-transformer';
import { UserRoles, UserStatus } from 'prisma/generated/client';

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
