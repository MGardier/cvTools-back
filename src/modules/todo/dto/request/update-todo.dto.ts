import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoRequestDto } from './create-todo.dto';

export class UpdateTodoRequestDto extends PartialType(CreateTodoRequestDto) {}
