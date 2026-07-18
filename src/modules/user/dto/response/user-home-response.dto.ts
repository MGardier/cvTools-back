import { Expose, Type } from 'class-transformer';

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

// TODO: reshape from ms-applications data once the recent-todos pattern exists
// (application domain delegated, list is always empty for now).
export class HomeRecentTodoDto {}

// TODO: reshape from ms-applications data once the recent-applications pattern
// exists (application domain delegated, list is always empty for now).
export class HomeRecentApplicationDto {}

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
