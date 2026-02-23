import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  HttpCode,
} from '@nestjs/common';

import { ContactService } from './contact.service';
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
  //                               UPDATE
  // =============================================================================

  @Patch(':id')
  @SerializeWith(ContactResponseDto)
  async update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactRequestDto,
  ): Promise<ContactResponseDto> {
    return await this.contactService.update(
      id,
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
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.contactService.delete(id, req.user.sub);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================


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
  async findOneById(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContactResponseDto> {
    return await this.contactService.findOne(id, req.user.sub);
  }
}
