import { IsNotEmpty, IsString } from 'class-validator';

// ============================================================================
//                                    LEGACY
//         Module outside Lot 1 scope (future module) - entirely legacy
// ============================================================================

export class CreateNoteRequestDto {
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description: string;
}
