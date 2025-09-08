
import {  IsNotEmpty, IsString } from "class-validator";

export class UpsertTechnologyDto {

  @IsNotEmpty()
  @IsString()
  name : string;

}
