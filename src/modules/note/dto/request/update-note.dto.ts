import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteRequestDto } from './create-note.dto';

// ============================================================================
//                                    LEGACY
//         Module outside Lot 1 scope (future module) - entirely legacy
// ============================================================================

export class UpdateNoteRequestDto extends PartialType(CreateNoteRequestDto) {}
