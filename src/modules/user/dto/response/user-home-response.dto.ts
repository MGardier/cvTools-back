import { Expose, Type } from 'class-transformer';

import { ApplicationResponseDto } from 'src/modules/application/dto/response/application.dto';
import { TodoResponseDto } from 'src/modules/todo/dto/response/todo.dto';

export class ApplicationCountsDto {
  @Expose()
  inProgress!: number;

  @Expose()
  toApply!: number;

  @Expose()
  interview!: number;

  @Expose()
  finished!: number;
}

export class UserHomeResponseDto {
  @Expose()
  @Type(() => ApplicationCountsDto)
  applicationCounts!: ApplicationCountsDto;

  @Expose()
  @Type(() => ApplicationResponseDto)
  recentApplications!: ApplicationResponseDto[];

  @Expose()
  @Type(() => TodoResponseDto)
  recentTodos!: TodoResponseDto[];
}
