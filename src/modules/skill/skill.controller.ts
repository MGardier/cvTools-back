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

import { SkillService } from './skill.service';
import { CreateSkillRequestDto } from './dto/request/create-skill.dto';
import { UpdateSkillRequestDto } from './dto/request/update-skill.dto';
import { SkillResponseDto } from './dto/response/skill.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  @Post()
  @SerializeWith(SkillResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: CreateSkillRequestDto,
  ): Promise<SkillResponseDto> {
    return await this.skillService.create(dto, req.user.sub);
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(SkillResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSkillRequestDto,
  ): Promise<SkillResponseDto> {
    return await this.skillService.update(id, req.user.sub, dto);
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  @Delete(':id')
  @HttpCode(204)
  @SkipSerialize()
  async remove(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.skillService.delete(id, req.user.sub);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(SkillResponseDto)
  async findAll(): Promise<SkillResponseDto[]> {
    return await this.skillService.findAll();
  }

  @Get('application/:applicationId')
  @SerializeWith(SkillResponseDto)
  async findAllByApplicationId(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<SkillResponseDto[]> {
    return await this.skillService.findAllByApplicationId(
      applicationId,
      req.user.sub,
    );
  }

  @Get(':id')
  @SerializeWith(SkillResponseDto)
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SkillResponseDto> {
    return await this.skillService.findOneById(id);
  }

  // =============================================================================
  //                        APPLICATION-SKILL (LINK)
  // =============================================================================

  @Post(':skillId/application/:applicationId')
  @HttpCode(201)
  @SkipSerialize()
  async linkToApplication(
    @Req() req: IAuthenticatedRequest,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<void> {
    await this.skillService.linkToApplication(
      applicationId,
      skillId,
      req.user.sub,
    );
  }

  @Delete(':skillId/application/:applicationId')
  @HttpCode(204)
  @SkipSerialize()
  async unlinkFromApplication(
    @Req() req: IAuthenticatedRequest,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<void> {
    await this.skillService.unlinkFromApplication(
      applicationId,
      skillId,
      req.user.sub,
    );
  }
}
