
import {  IsNotEmpty, IsString } from "class-validator";

export class CreateTechnologyDto {

  @IsNotEmpty()
  @IsString()
  name : string;

}
