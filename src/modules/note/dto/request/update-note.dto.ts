import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteRequestDto } from './create-note.dto';

export class UpdateNoteRequestDto extends PartialType(CreateNoteRequestDto) {}
