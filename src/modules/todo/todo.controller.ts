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

import { TodoService } from './todo.service';
import { CreateTodoRequestDto } from './dto/request/create-todo.dto';
import { UpdateTodoRequestDto } from './dto/request/update-todo.dto';
import { TodoResponseDto } from './dto/response/todo.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application/:applicationId/todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  @Post()
  @SerializeWith(TodoResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: CreateTodoRequestDto,
  ): Promise<TodoResponseDto> {
    return await this.todoService.create(applicationId, req.user.sub, dto);
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(TodoResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoRequestDto,
  ): Promise<TodoResponseDto> {
    return await this.todoService.update(id, applicationId, req.user.sub, dto);
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
    await this.todoService.delete(id, applicationId, req.user.sub);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(TodoResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<TodoResponseDto[]> {
    return await this.todoService.findAllByApplicationId(
      applicationId,
      req.user.sub,
    );
  }
}
