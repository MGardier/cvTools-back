import { EntityTypeForAddress } from "@prisma/client";

export interface CreateAddressInterface {

  city: string;
  postalCode: string;
  street: string;
  entityType: EntityTypeForAddress;
  entityId: number;
}