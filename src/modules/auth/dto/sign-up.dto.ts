import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  
  @IsEmail({},{message: "L'email doit être un email valide."})
  @IsNotEmpty({message:"L'email ne peut pas être vide."})
  email: string;

  
  @IsNotEmpty({message:"Le mot de passe ne peut pas être vide."})
  @MinLength(8,{message :"Le mot de passe doit comporter au moins 8 caractères."})
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,{
    message : "Le mot de passe doit contenir des lettres minuscules et majuscules, des caractéres spéciaux et des chiffres."
  })
  password: string;


}
