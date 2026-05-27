import { Controller, Get, Req } from '@nestjs/common';

import { UserService } from './user.service';
import { UserHomeResponseDto } from './dto/response/user-home-response.dto';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =============================================================================
  //                               HOME
  // =============================================================================

  @Get('me/home')
  @SerializeWith(UserHomeResponseDto)
  async getHomeData(
    @Req() req: IAuthenticatedRequest,
  ): Promise<UserHomeResponseDto> {
    return await this.userService.getHomeData(req.user.sub);
  }
}
