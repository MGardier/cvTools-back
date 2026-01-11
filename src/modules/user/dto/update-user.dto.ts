import { OmitType, PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from '../../auth/dto/sign-up.dto';

export class UpdateUserDto extends OmitType(SignUpDto, ['password']) {}
