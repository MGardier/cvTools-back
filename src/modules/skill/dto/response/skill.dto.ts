import { Expose } from 'class-transformer';

export class SkillResponseDto {
  @Expose()
  id: number;

  @Expose()
  label: string;

  @Expose()
  createdAt: Date;
}
