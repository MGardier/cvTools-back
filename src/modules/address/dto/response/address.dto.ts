import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  id: number;

  @Expose()
  city: string;

  @Expose()
  postalCode: string;
}
