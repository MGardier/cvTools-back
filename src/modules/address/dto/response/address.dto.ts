import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  id: number;

  @Expose()
  city: string;

  @Expose()
  postalCode: string;

  @Expose()
  street: string | null;

  @Expose()
  complement: string | null;

  @Expose()
  streetNumber: string | null;
}
