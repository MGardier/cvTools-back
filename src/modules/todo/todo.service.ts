import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { TodoRepository } from './todo.repository';
import { ApplicationService } from '../application/application.service';
import { CreateTodoRequestDto } from './dto/request/create-todo.dto';
import { UpdateTodoRequestDto } from './dto/request/update-todo.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { Todo, StatusTodo } from '@prisma/client';
import { TTodoStatusCounts, TTodoWithCompany } from './types';

@Injectable()
export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    applicationId: number,
    userId: number,
    dto: CreateTodoRequestDto,
  ): Promise<Todo> {
    await this.applicationService.findOne(applicationId, userId);

    return this.todoRepository.create({
      description: dto.description,
      status: dto.status,
      applicationId,
    });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    applicationId: number,
    userId: number,
    dto: UpdateTodoRequestDto,
  ): Promise<Todo> {
    await this.applicationService.findOne(applicationId, userId);
    await this.__findOneOrFail(id, applicationId);

    return this.todoRepository.update(id, dto);
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(
    id: number,
    applicationId: number,
    userId: number,
  ): Promise<void> {
    await this.applicationService.findOne(applicationId, userId);
    await this.__findOneOrFail(id, applicationId);

    await this.todoRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
    userId: number,
    sort: 'asc' | 'desc' = 'desc',
    status?: StatusTodo,
  ): Promise<Todo[]> {
    await this.applicationService.findOne(applicationId, userId);

    return this.todoRepository.findAllByApplicationId(
      applicationId,
      sort,
      status,
    );
  }

  async findRecentByUserId(
    userId: number,
    limit: number,
  ): Promise<TTodoWithCompany[]> {
    return this.todoRepository.findRecentByUserId(userId, limit);
  }

  // =============================================================================
  //                               COUNT
  // =============================================================================

  async countByStatusForUser(userId: number): Promise<TTodoStatusCounts> {
    return this.todoRepository.countByStatusForUser(userId);
  }

  async countByStatusForApplicationIds(
    userId: number,
    applicationIds: number[],
  ): Promise<Map<number, TTodoStatusCounts>> {
    return this.todoRepository.countByStatusForApplicationIds(
      userId,
      applicationIds,
    );
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __findOneOrFail(
    id: number,
    applicationId: number,
  ): Promise<Todo> {
    const todo = await this.todoRepository.findOneByIdAndApplicationId(
      id,
      applicationId,
    );

    if (!todo) throw new NotFoundException(ErrorCodeEnum.TODO_NOT_FOUND_ERROR);

    return todo;
  }
}
