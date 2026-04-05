import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusTodo } from '@prisma/client';

export class CreateTodoRequestDto {
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MaxLength(150, {
    message: 'La description ne peut pas dépasser 150 caractères',
  })
  description: string;

  @IsOptional()
  @IsEnum(StatusTodo, { message: 'Le statut doit être valide' })
  status?: StatusTodo;
}
