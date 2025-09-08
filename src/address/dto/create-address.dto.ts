
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAddressDto {

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  street: string;
}
