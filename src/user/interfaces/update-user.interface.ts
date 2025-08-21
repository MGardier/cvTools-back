import { UserStatus } from "@prisma/client";

export interface UpdateUserInterface {

  email?: string;
  password?: string;
  status?: UserStatus;
}