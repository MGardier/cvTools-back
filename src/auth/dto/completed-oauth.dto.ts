import { LoginMethod } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class CompletedOauthDto {
  @IsNotEmpty()
  oauthId : string;

   @IsNotEmpty()
   @IsEnum(LoginMethod)
  loginMethod : LoginMethod;
}