import { Injectable } from '@nestjs/common';
import { ApplicationStatus, User } from '@prisma/client';
import { UserRepository } from './user.repository';
import {
  IUpdateUser,
  IFindOneByOauthId,
  ICreateUser,
  THomeCountCategory,
} from './types';
import { ApplicationService } from '../application/application.service';
import { TodoService } from '../todo/todo.service';
import { UserHomeResponseDto } from './dto/response/user-home-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicationService: ApplicationService,
    private readonly todoService: TodoService,
  ) {}

  async create(data: ICreateUser): Promise<User> {
    return await this.userRepository.create(data);
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

  // =============================================================================
  //                               HOME
  // =============================================================================

  async getHomeData(userId: number): Promise<UserHomeResponseDto> {
    const RECENT_LIMIT = 3;
    const [rawCounts, recentApplications, recentTodos] = await Promise.all([
      this.applicationService.countByStatusForUser(userId),
      this.applicationService.findRecentByUserId(userId, RECENT_LIMIT),
      this.todoService.findRecentByUserId(userId, RECENT_LIMIT),
    ]);

    const applicationCounts: Record<THomeCountCategory, number> = {
      inProgress: 0,
      toApply: 0,
      interview: 0,
      finished: 0,
    };

    for (const [status, count] of Object.entries(rawCounts) as [
      ApplicationStatus,
      number,
    ][]) {
      applicationCounts[this.__mapStatusToCategory(status)] += count;
    }

    return { applicationCounts, recentApplications, recentTodos };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

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
}
