import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Req,
  HttpCode,
} from '@nestjs/common';

import { ApplicationService } from './application.service';
import { CreateApplicationRequestDto } from './dto/request/create-application.dto';
import { FindAllApplicationRequestDto } from './dto/request/find-all-application.dto';
import { ApplicationResponseDto } from './dto/response/application.dto';
import { PaginatedApplicationResponseDto } from './dto/response/paginated-application.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  // ==========================================================================
  //                                 REFACTORED
  //    New code compliant with the Candidature refactor (Lot 1 - CAND-xxx)
  // ==========================================================================

  // --------------------------------- CREATE ---------------------------------

  @Post()
  @SerializeWith(ApplicationResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: CreateApplicationRequestDto,
  ): Promise<ApplicationResponseDto> {
    return await this.applicationService.create(req.user.sub, dto);
  }

  // ==========================================================================
  //                                   LEGACY
  //    Old code - move above to REFACTORED when reused/adapted, else delete
  // ==========================================================================

  // --------------------------------- DELETE ---------------------------------

  @Delete(':id')
  @HttpCode(204)
  @SkipSerialize()
  async remove(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.applicationService.delete(id, req.user.sub);
  }

  // ---------------------------------- FIND ----------------------------------

  @Get()
  @SerializeWith(PaginatedApplicationResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FindAllApplicationRequestDto,
  ): Promise<PaginatedApplicationResponseDto> {
    return await this.applicationService.findAll(req.user.sub, query);
  }

  @Get(':id')
  @SerializeWith(ApplicationResponseDto)
  async findOne(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApplicationResponseDto> {
    return await this.applicationService.findOne(id, req.user.sub);
  }
}
