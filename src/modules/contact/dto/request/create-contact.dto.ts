import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
} from 'class-validator';
export class CreateContactRequestDto {
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  firstname: string;

  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  lastname: string;

  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  @IsEmail({}, { message: "L'email doit être un email valide." })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères.' })
  phone?: string;

  @IsNotEmpty({ message: 'La profession ne peut pas être vide.' })
  @IsString({ message: 'La profession doit être une chaîne de caractères.' })
  profession: string;

  @IsOptional()
  @IsInt({message: 'L\'id de la candidature doit être un number'})
  applicationId?: number;
}
