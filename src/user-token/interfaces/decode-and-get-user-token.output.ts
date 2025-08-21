import { UserToken } from "@prisma/client";
import { PayloadJwtInterface } from "src/jwt-manager/interfaces/payload-jwt.interface";


export interface DecodeAndGetUserTokenOutput {
  userToken: Partial<UserToken>;
  payload : PayloadJwtInterface;
}