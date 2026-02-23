import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSkillRequestDto {
  @IsNotEmpty({ message: 'Le libellé ne peut pas être vide.' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères.' })
  label: string;
}
