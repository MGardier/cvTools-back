import { Expose } from 'class-transformer';

export class NoteResponseDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  applicationId: number;
}
