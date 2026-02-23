import { IsNotEmpty, IsUrl } from 'class-validator';

export class ExtractUrlRequestDto {
  @IsNotEmpty({ message: "L'URL ne peut pas être vide." })
  @IsUrl({}, { message: "L'URL doit être une URL valide." })
  url: string;
}
