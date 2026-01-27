import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAccountRequestDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
