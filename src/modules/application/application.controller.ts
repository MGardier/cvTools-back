import { Controller, Get, Req } from '@nestjs/common';

import { ApplicationService } from './application.service';
import { ApplicationResponseDto } from './dto/response/application.dto';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  // =============================================================================
  //                               FIND
  // =============================================================================

  @Get()
  @SerializeWith(ApplicationResponseDto)
  async findAll(
    @Req() req: IAuthenticatedRequest,
  ): Promise<ApplicationResponseDto[]> {
    return await this.applicationService.findAll(req.user.sub);
  }
}
