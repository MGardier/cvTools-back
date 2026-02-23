import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressInputDto {
  @IsNotEmpty({ message: 'La ville ne peut pas être vide.' })
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  city: string;

  @IsNotEmpty({ message: 'Le code postal ne peut pas être vide.' })
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  postalCode: string;

  @IsOptional()
  @IsString({ message: 'La rue doit être une chaîne de caractères.' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'Le complément doit être une chaîne de caractères.' })
  complement?: string;

  @IsOptional()
  @IsString({ message: 'Le numéro de rue doit être une chaîne de caractères.' })
  streetNumber?: string;
}
