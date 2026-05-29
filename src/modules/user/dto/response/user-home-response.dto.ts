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

export class TodoCountsDto {
  @Expose()
  toMake!: number;

  @Expose()
  inProgress!: number;
}

export class RecentApplicationTodoCountsDto {
  @Expose()
  toMake!: number;

  @Expose()
  inProgress!: number;

  @Expose()
  total!: number;
}

export class HomeRecentTodoDto extends TodoResponseDto {
  @Expose()
  company!: string | null;
}

export class HomeRecentApplicationDto extends ApplicationResponseDto {
  @Expose()
  @Type(() => RecentApplicationTodoCountsDto)
  todoCounts!: RecentApplicationTodoCountsDto;
}

export class UserHomeResponseDto {
  @Expose()
  @Type(() => ApplicationCountsDto)
  applicationCounts!: ApplicationCountsDto;

  @Expose()
  @Type(() => TodoCountsDto)
  todoCounts!: TodoCountsDto;

  @Expose()
  @Type(() => HomeRecentApplicationDto)
  recentApplications!: HomeRecentApplicationDto[];

  @Expose()
  @Type(() => HomeRecentTodoDto)
  recentTodos!: HomeRecentTodoDto[];
}
