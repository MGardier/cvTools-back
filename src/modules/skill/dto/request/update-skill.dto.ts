import {  PickType } from '@nestjs/mapped-types';
import { CreateSkillRequestDto } from './create-skill.dto';

export class UpdateSkillRequestDto extends PickType(CreateSkillRequestDto,['label']) {}
