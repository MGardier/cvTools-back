import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Get()
  // async findAll() {
  //   return await this.userService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.userService.findOneById(+id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return await this.userService.update(+id, updateUserDto);
  // }

  // @Patch(':id')
  // async updateEmail(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return await this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.userService.remove(+id);
  // }

}
