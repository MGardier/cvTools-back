import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContactRequestDto } from './create-contact.dto';

export class UpdateContactRequestDto extends PartialType(
  OmitType(CreateContactRequestDto, ['applicationId'])
) { }
