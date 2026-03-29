import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteRequestDto {
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description: string;
}
