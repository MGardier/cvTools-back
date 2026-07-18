import { Controller, Get } from '@nestjs/common';

import { UserService } from './user.service';
import { UserHomeResponseDto } from './dto/response/user-home-response.dto';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =============================================================================
  //                               HOME
  // =============================================================================

  @Get('me/home')
  @SerializeWith(UserHomeResponseDto)
  async getHomeData(): Promise<UserHomeResponseDto> {
    return await this.userService.getHomeData();
  }
}
