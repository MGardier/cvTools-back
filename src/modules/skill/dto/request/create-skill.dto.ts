import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSkillRequestDto {
  @IsNotEmpty({ message: 'Le libellé ne peut pas être vide.' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le libellé ne peut pas dépasser 100 caractères.' })
  label: string;
}
