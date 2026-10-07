import { Expose } from 'class-transformer';

export class ValidateInvitationResponseDto {
  @Expose()
  email!: string;
}
