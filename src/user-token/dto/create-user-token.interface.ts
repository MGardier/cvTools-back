import { PrismaTokenType } from "@prisma/client";
import { TokenType } from "../enum/token-type.enum";

export interface CreateUserTokenInterface {
  token: string;
  type: PrismaTokenType;
  expiresIn: Date;
  uuid?: string;
}