import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  HttpCode,
} from '@nestjs/common';

import { NoteService } from './note.service';
import { CreateNoteRequestDto } from './dto/request/create-note.dto';
import { UpdateNoteRequestDto } from './dto/request/update-note.dto';
import { NoteResponseDto } from './dto/response/note.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application/:applicationId/note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  @Post()
  @SerializeWith(NoteResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: CreateNoteRequestDto,
  ): Promise<NoteResponseDto> {
    return await this.noteService.create(applicationId, req.user.sub, dto);
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(NoteResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteRequestDto,
  ): Promise<NoteResponseDto> {
    return await this.noteService.update(id, applicationId, req.user.sub, dto);
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  @Delete(':id')
  @HttpCode(204)
  @SkipSerialize()
  async remove(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.noteService.delete(id, applicationId, req.user.sub);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(NoteResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<NoteResponseDto[]> {
    return await this.noteService.findAllByApplicationId(
      applicationId,
      req.user.sub,
    );
  }
}
