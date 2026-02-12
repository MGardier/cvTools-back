import { IsNotEmpty, IsString } from "class-validator";

export class AddressInputDto {
  @IsNotEmpty({ message: 'La ville ne peut pas être vide.' })
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  city: string;

  @IsNotEmpty({ message: 'Le code postal ne peut pas être vide.' })
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  postalCode: string;
}