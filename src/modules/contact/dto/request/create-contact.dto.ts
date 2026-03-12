import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';
export class CreateContactRequestDto {
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères.' })
  firstname: string;

  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères.' })
  lastname: string;

  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  @IsEmail({}, { message: "L'email doit être un email valide." })
  @MaxLength(100, { message: "L'email ne peut pas dépasser 100 caractères." })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères.' })
  @MaxLength(20, { message: 'Le téléphone ne peut pas dépasser 20 caractères.' })
  phone?: string;

  @IsNotEmpty({ message: 'La profession ne peut pas être vide.' })
  @IsString({ message: 'La profession doit être une chaîne de caractères.' })
  @MaxLength(50, { message: 'La profession ne peut pas dépasser 50 caractères.' })
  profession: string;

}
