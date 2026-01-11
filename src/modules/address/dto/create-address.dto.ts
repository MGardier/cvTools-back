
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAddressDto {

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  postalCode: string;

}
