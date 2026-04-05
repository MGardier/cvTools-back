import { Expose } from 'class-transformer';
import { StatusTodo } from '@prisma/client';

export class TodoResponseDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Expose()
  status: StatusTodo;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  applicationId: number;
}
