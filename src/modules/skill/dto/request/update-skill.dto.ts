import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillRequestDto } from './create-skill.dto';

export class UpdateSkillRequestDto extends PartialType(CreateSkillRequestDto) {}
