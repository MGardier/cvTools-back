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

import { ApplicationHistoryService } from './application-history.service';
import { CreateApplicationHistoryRequestDto } from './dto/request/create-application-history.dto';
import { UpdateApplicationHistoryRequestDto } from './dto/request/update-application-history.dto';
import { ApplicationHistoryResponseDto } from './dto/response/application-history.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application/:applicationId/history')
export class ApplicationHistoryController {
  constructor(
    private readonly applicationHistoryService: ApplicationHistoryService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  @Post()
  @SerializeWith(ApplicationHistoryResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: CreateApplicationHistoryRequestDto,
  ): Promise<ApplicationHistoryResponseDto> {
    return await this.applicationHistoryService.create(
      applicationId,
      req.user.sub,
      dto,
    );
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(ApplicationHistoryResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationHistoryRequestDto,
  ): Promise<ApplicationHistoryResponseDto> {
    return await this.applicationHistoryService.update(
      id,
      applicationId,
      req.user.sub,
      dto,
    );
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
    await this.applicationHistoryService.delete(
      id,
      applicationId,
      req.user.sub,
    );
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(ApplicationHistoryResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<ApplicationHistoryResponseDto[]> {
    return await this.applicationHistoryService.findAllByApplicationId(
      applicationId,
      req.user.sub,
    );
  }
}
