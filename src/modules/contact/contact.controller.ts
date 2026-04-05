import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  HttpCode,
} from '@nestjs/common';

import { ContactService } from './contact.service';
import { CreateContactRequestDto } from './dto/request/create-contact.dto';
import { UpdateContactRequestDto } from './dto/request/update-contact.dto';
import { ContactResponseDto } from './dto/response/contact.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  @Post()
  @SerializeWith(ContactResponseDto)
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: CreateContactRequestDto,
  ): Promise<ContactResponseDto> {
    return await this.contactService.create(req.user.sub, dto);
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(ContactResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactRequestDto,
  ): Promise<ContactResponseDto> {
    return await this.contactService.update(id, req.user.sub, dto);
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
    await this.contactService.delete(id, req.user.sub);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(ContactResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
    @Query('search') search?: string,
  ): Promise<ContactResponseDto[]> {
    return await this.contactService.search(req.user.sub, search);
  }

  @Get('application/:applicationId')
  @SerializeWith(ContactResponseDto)
  async findAllByApplicationId(
    @Req() req: IAuthenticatedRequest,
    @Param('applicationId', ParseIntPipe)
    applicationId: number,
  ): Promise<ContactResponseDto[]> {
    return await this.contactService.findAllByApplicationId(
      applicationId,
      req.user.sub,
    );
  }

  @Get(':id')
  @SerializeWith(ContactResponseDto)
  async findOne(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContactResponseDto> {
    return await this.contactService.findOne(id, req.user.sub);
  }

  // =============================================================================
  //                  APPLICATION-CONTACT (RELATION LINK)
  // =============================================================================

  @Post(':contactId/application/:applicationId')
  @HttpCode(204)
  @SkipSerialize()
  async linkToApplication(
    @Req() req: IAuthenticatedRequest,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<void> {
    await this.contactService.linkToApplication(
      applicationId,
      contactId,
      req.user.sub,
    );
  }

  @Delete(':contactId/application/:applicationId')
  @HttpCode(204)
  @SkipSerialize()
  async unlinkFromApplication(
    @Req() req: IAuthenticatedRequest,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<void> {
    await this.contactService.unlinkFromApplication(
      applicationId,
      contactId,
      req.user.sub,
    );
  }
}
