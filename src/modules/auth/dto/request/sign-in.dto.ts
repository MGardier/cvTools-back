import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInRequestDto {
  @IsEmail({}, { message: "L'email doit être un email valide." })
  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide.' })
  password: string;
}
