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

import { ApplicationService } from './application.service';
import { CreateApplicationRequestDto } from './dto/request/create-application.dto';
import { UpdateApplicationRequestDto } from './dto/request/update-application.dto';
import { ApplicationResponseDto } from './dto/response/application.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /********* CREATE *********/

  @Post()
  @SerializeWith(ApplicationResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: CreateApplicationRequestDto,
  ): Promise<ApplicationResponseDto> {
    return await this.applicationService.create(req.user.sub, dto);
  }

  /********* UPDATE *********/

  @Patch(':id')
  @SerializeWith(ApplicationResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationRequestDto,
  ): Promise<ApplicationResponseDto> {
    return await this.applicationService.update(id, req.user.sub, dto);
  }

  /********* DELETE *********/

  @Delete(':id')
  @HttpCode(204)
  @SkipSerialize()
  async remove(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.applicationService.delete(id, req.user.sub);
  }

  /********* FIND *********/

  @Get()
  @SerializeWith(ApplicationResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
  ): Promise<ApplicationResponseDto[]> {
    return await this.applicationService.findAll(req.user.sub);
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
