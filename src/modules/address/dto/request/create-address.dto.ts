import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddressInputDto {
  @IsNotEmpty({ message: 'La ville ne peut pas être vide.' })
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères.' })
  city: string;

  @IsNotEmpty({ message: 'Le code postal ne peut pas être vide.' })
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  @MaxLength(10, {
    message: 'Le code postal ne peut pas dépasser 10 caractères.',
  })
  postalCode: string;

  @IsOptional()
  @IsString({ message: 'La rue doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'La rue ne peut pas dépasser 100 caractères.' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'Le complément doit être une chaîne de caractères.' })
  @MaxLength(100, {
    message: 'Le complément ne peut pas dépasser 100 caractères.',
  })
  complement?: string;

  @IsOptional()
  @IsString({ message: 'Le numéro de rue doit être une chaîne de caractères.' })
  @MaxLength(10, {
    message: 'Le numéro de rue ne peut pas dépasser 10 caractères.',
  })
  streetNumber?: string;
}
