import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { ApplicationHistoryRepository } from './application-history.repository';
import { ApplicationService } from '../application/application.service';
import { CreateApplicationHistoryRequestDto } from './dto/request/create-application-history.dto';
import { UpdateApplicationHistoryRequestDto } from './dto/request/update-application-history.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { ApplicationHistory } from '@prisma/client';

@Injectable()
export class ApplicationHistoryService {
  constructor(
    private readonly applicationHistoryRepository: ApplicationHistoryRepository,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    applicationId: number,
    userId: number,
    dto: CreateApplicationHistoryRequestDto,
  ): Promise<ApplicationHistory> {
    await this.applicationService.findOne(applicationId, userId);

    return this.applicationHistoryRepository.create({
      ...dto,
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
    dto: UpdateApplicationHistoryRequestDto,
  ): Promise<ApplicationHistory> {
    await this.applicationService.findOne(applicationId, userId);
    await this.__findOneOrFail(id, applicationId);

    return this.applicationHistoryRepository.update(id, dto);
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

    await this.applicationHistoryRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationHistory[]> {
    await this.applicationService.findOne(applicationId, userId);

    return this.applicationHistoryRepository.findAllByApplicationId(
      applicationId,
    );
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __findOneOrFail(
    id: number,
    applicationId: number,
  ): Promise<ApplicationHistory> {
    const history =
      await this.applicationHistoryRepository.findOneByIdAndApplicationId(
        id,
        applicationId,
      );

    if (!history)
      throw new NotFoundException(
        ErrorCodeEnum.APPLICATION_HISTORY_NOT_FOUND_ERROR,
      );

    return history;
  }
}
