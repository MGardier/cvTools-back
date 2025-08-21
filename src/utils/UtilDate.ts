import { PrismaTokenType } from "@prisma/client";
import { TokenType } from "src/user-token/enum/token-type.enum";

export abstract class UtilDate {

  static __convertExpiresToDate(expiresIn: number): Date {
    return new Date(new Date().getTime() + expiresIn * 1000);
  }
}


