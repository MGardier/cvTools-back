import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationHistoryRequestDto } from './create-application-history.dto';

export class UpdateApplicationHistoryRequestDto extends PartialType(
  CreateApplicationHistoryRequestDto,
) {}
