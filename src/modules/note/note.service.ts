import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { NoteRepository } from './note.repository';
import { ApplicationService } from '../application/application.service';
import { CreateNoteRequestDto } from './dto/request/create-note.dto';
import { UpdateNoteRequestDto } from './dto/request/update-note.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { Note } from '@prisma/client';

@Injectable()
export class NoteService {
  constructor(
    private readonly noteRepository: NoteRepository,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    applicationId: number,
    userId: number,
    dto: CreateNoteRequestDto,
  ): Promise<Note> {
    await this.applicationService.findOne(applicationId, userId);

    return this.noteRepository.create({
      description: dto.description,
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
    dto: UpdateNoteRequestDto,
  ): Promise<Note> {
    await this.applicationService.findOne(applicationId, userId);
    await this.__findOneOrFail(id, applicationId);

    return this.noteRepository.update(id, dto);
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

    await this.noteRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByApplicationId(
    applicationId: number,
    userId: number,
  ): Promise<Note[]> {
    await this.applicationService.findOne(applicationId, userId);

    return this.noteRepository.findAllByApplicationId(applicationId);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __findOneOrFail(
    id: number,
    applicationId: number,
  ): Promise<Note> {
    const note = await this.noteRepository.findOneByIdAndApplicationId(
      id,
      applicationId,
    );

    if (!note) throw new NotFoundException(ErrorCodeEnum.NOTE_NOT_FOUND_ERROR);

    return note;
  }
}
