import { Expose } from 'class-transformer';

export class ContactResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstname: string;

  @Expose()
  lastname: string;

  @Expose()
  email: string;

  @Expose()
  phone: string | null;

  @Expose()
  profession: string;

  @Expose()
  applicationId: number;
}
