import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationHistoryRequestDto } from './create-application-history.dto';

// ============================================================================
//                                    LEGACY
//         Module outside Lot 1 scope (future module) - entirely legacy
// ============================================================================

export class UpdateApplicationHistoryRequestDto extends PartialType(
  CreateApplicationHistoryRequestDto,
) {}
