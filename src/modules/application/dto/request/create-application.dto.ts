import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

import { TrimToUndefined } from 'src/shared/decorators/trim-to-undefined.decorator';
import { AtLeastOneOf } from 'src/shared/validators/at-least-one-of.validator';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

// ============================================================================
//                                 REFACTORED
//     New code compliant with the Candidature refactor (Lot 1 - CAND-001)
// ============================================================================

@AtLeastOneOf(['company', 'title', 'subject', 'url'])
export class CreateApplicationRequestDto {
  @IsOptional()
  @TrimToUndefined()
  @IsString({ message: DtoErrorCodeEnum.APPLICATION_TITLE_INVALID })
  @MaxLength(100, { message: DtoErrorCodeEnum.APPLICATION_TITLE_TOO_LONG })
  title?: string;

  @IsOptional()
  @TrimToUndefined()
  @IsString({ message: DtoErrorCodeEnum.APPLICATION_COMPANY_INVALID })
  @MaxLength(100, { message: DtoErrorCodeEnum.APPLICATION_COMPANY_TOO_LONG })
  company?: string;

  @IsOptional()
  @TrimToUndefined()
  @IsString({ message: DtoErrorCodeEnum.APPLICATION_SUBJECT_INVALID })
  @MaxLength(150, { message: DtoErrorCodeEnum.APPLICATION_SUBJECT_TOO_LONG })
  subject?: string;

  @IsOptional()
  @TrimToUndefined()
  @IsUrl({}, { message: DtoErrorCodeEnum.APPLICATION_URL_INVALID })
  url?: string;
}
