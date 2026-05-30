import { Injectable } from '@nestjs/common';
import { ApplicationStatus, Prisma, StatusTodo, User } from '@prisma/client';
import { UserRepository } from './user.repository';
import {
  IUpdateUser,
  IFindOneByOauthId,
  ICreateUser,
  THomeCountCategory,
  THomeTodoCategory,
} from './types';
import { ApplicationService } from '../application/application.service';
import { TodoService } from '../todo/todo.service';
import { TTodoStatusCounts, TTodoWithCompany } from '../todo/types';
import { TApplicationWithAddressAndSkills } from '../application/types';
import {
  ApplicationCountsDto,
  HomeRecentTodoDto,
  RecentApplicationTodoCountsDto,
  TodoCountsDto,
  UserHomeResponseDto,
} from './dto/response/user-home-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicationService: ApplicationService,
    private readonly todoService: TodoService,
  ) {}

  async create(
    data: ICreateUser,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    return await this.userRepository.create(data, tx);
  }

  async update(id: number, data: IUpdateUser): Promise<User> {
    return await this.userRepository.update(id, data);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOneById(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async findOneByOauthId(data: IFindOneByOauthId): Promise<User | null> {
    return await this.userRepository.findOneByOauthId(data);
  }

  async findActiveAdmin(): Promise<User | null> {
    return await this.userRepository.findActiveAdmin();
  }

  // =============================================================================
  //                               HOME
  // =============================================================================

  async getHomeData(userId: number): Promise<UserHomeResponseDto> {
    const RECENT_LIMIT = 3;
    const [rawAppCounts, rawTodoCounts, recentApps, rawRecentTodos] =
      await Promise.all([
        this.applicationService.countByStatusForUser(userId),
        this.todoService.countByStatusForUser(userId),
        this.applicationService.findRecentByUserId(userId, RECENT_LIMIT),
        this.todoService.findRecentByUserId(userId, RECENT_LIMIT),
      ]);

    const todoCountsByApp =
      await this.todoService.countByStatusForApplicationIds(
        userId,
        recentApps.map((app) => app.id),
      );

    return {
      applicationCounts: this.__buildApplicationCounts(rawAppCounts),
      todoCounts: this.__buildGlobalTodoCounts(rawTodoCounts),
      recentApplications: this.__buildRecentApplications(
        recentApps,
        todoCountsByApp,
      ),
      recentTodos: this.__buildRecentTodos(rawRecentTodos),
    };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private __buildApplicationCounts(
    raw: Partial<Record<ApplicationStatus, number>>,
  ): ApplicationCountsDto {
    const counts: Record<THomeCountCategory, number> = {
      inProgress: 0,
      toApply: 0,
      interview: 0,
      finished: 0,
    };

    for (const [status, count] of Object.entries(raw) as [
      ApplicationStatus,
      number,
    ][]) {
      counts[this.__mapStatusToCategory(status)] += count;
    }

    return counts;
  }

  private __buildGlobalTodoCounts(raw: TTodoStatusCounts): TodoCountsDto {
    const counts: Record<THomeTodoCategory, number> = {
      toMake: 0,
      inProgress: 0,
    };

    for (const [status, count] of Object.entries(raw) as [
      StatusTodo,
      number,
    ][]) {
      const category = this.__mapStatusTodoToCategory(status);
      if (category) counts[category] += count;
    }

    return counts;
  }

  private __buildRecentApplications(
    apps: TApplicationWithAddressAndSkills[],
    todoCountsByApp: Map<number, TTodoStatusCounts>,
  ): (TApplicationWithAddressAndSkills & {
    todoCounts: RecentApplicationTodoCountsDto;
  })[] {
    return apps.map((app) => ({
      ...app,
      todoCounts: this.__buildApplicationTodoCounts(
        todoCountsByApp.get(app.id) ?? {},
      ),
    }));
  }

  private __buildApplicationTodoCounts(
    counts: TTodoStatusCounts,
  ): RecentApplicationTodoCountsDto {
    return {
      toMake: counts[StatusTodo.TO_MAKE] ?? 0,
      inProgress: counts[StatusTodo.IN_PROGRESS] ?? 0,
      total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    };
  }

  private __buildRecentTodos(todos: TTodoWithCompany[]): HomeRecentTodoDto[] {
    return todos.map(({ application, ...rest }) => ({
      ...rest,
      company: application.company,
    }));
  }

  private __mapStatusToCategory(status: ApplicationStatus): THomeCountCategory {
    switch (status) {
      case ApplicationStatus.APPLIED:
      case ApplicationStatus.FIRST_CONTACT:
        return 'inProgress';
      case ApplicationStatus.TO_APPLY:
      case ApplicationStatus.OFFER_RECEIVED:
        return 'toApply';
      case ApplicationStatus.FIRST_INTERVIEW:
      case ApplicationStatus.FOLLOW_UP_INTERVIEW:
        return 'interview';
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.GHOSTED:
      case ApplicationStatus.WITHDRAWN:
      case ApplicationStatus.ACCEPTED:
        return 'finished';
    }
  }

  private __mapStatusTodoToCategory(
    status: StatusTodo,
  ): THomeTodoCategory | undefined {
    switch (status) {
      case StatusTodo.TO_MAKE:
        return 'toMake';
      case StatusTodo.IN_PROGRESS:
        return 'inProgress';
      case StatusTodo.DONE:
      case StatusTodo.ARCHIVED:
        return undefined;
    }
  }
}
