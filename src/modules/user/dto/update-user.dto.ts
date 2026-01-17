import { OmitType } from '@nestjs/mapped-types';
import { SignUpRequestDto } from 'src/modules/auth/dto/request/sign-up.dto';


export class UpdateUserDto extends OmitType(SignUpRequestDto, ['password']) {}
