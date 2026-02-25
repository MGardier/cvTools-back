import { Prisma, PrismaTokenType, AddressTable } from '@prisma/client';
import { TSortItem } from 'src/shared/types/repository.types';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';

import { AddressInputDto } from 'src/modules/address/dto/request/create-address.dto';
import { TCreateAddress, TUpdateAddress } from 'src/modules/address/types';
import { CreateContactRequestDto } from 'src/modules/contact/dto/request/create-contact.dto';
import { UpdateContactRequestDto } from 'src/modules/contact/dto/request/update-contact.dto';
import { ICreateContact, IUpdateContact } from 'src/modules/contact/types';
import { TCreateSkill } from 'src/modules/skill/types';

export abstract class UtilRepository {
  static getSortedColumns<TData>(
    columns?: TSortItem<TData>[],
  ): Record<keyof TData, Prisma.SortOrder>[] {
    if (!columns) return [];
    return columns?.map((column) => {
      return { [column.field]: column.direction } as Record<
        keyof TData,
        Prisma.SortOrder
      >;
    });
  }

  static toPrismaTokenType(tokenType: TokenType): PrismaTokenType {
    const mapping: Partial<Record<TokenType, PrismaTokenType>> = {
      [TokenType.REFRESH]: PrismaTokenType.REFRESH,
      [TokenType.FORGOT_PASSWORD]: PrismaTokenType.FORGOT_PASSWORD,
      [TokenType.CONFIRM_ACCOUNT]: PrismaTokenType.CONFIRM_ACCOUNT,
    };
    const result = mapping[tokenType];
    if (!result) throw new Error(`No Prisma mapping for token type: ${tokenType}`);
    return result;
  }
}

// =============================================================================
//                               ADDRESS
// =============================================================================

export function mapAddressDtoToCreateData(
  dto: AddressInputDto,
  tableName: AddressTable,
  tableId: number,
): TCreateAddress {
  return {
    city: dto.city,
    postalCode: dto.postalCode,
    street: dto.street ?? null,
    complement: dto.complement ?? null,
    streetNumber: dto.streetNumber ?? null,
    tableName,
    tableId,
  };
}

export function mapAddressDtoToUpdateData(
  dto: AddressInputDto,
): TUpdateAddress {
  return {
    city: dto.city,
    postalCode: dto.postalCode,
    street: dto.street ?? null,
    complement: dto.complement ?? null,
    streetNumber: dto.streetNumber ?? null,
  };
}

// =============================================================================
//                               CONTACT
// =============================================================================

export function mapContactDtoToCreateData(
  dto: CreateContactRequestDto,
  userId: number,
): ICreateContact {
  return {
    firstname: dto.firstname,
    lastname: dto.lastname,
    email: dto.email,
    phone: dto.phone,
    profession: dto.profession,
    createdBy: userId,
    applicationId: dto.applicationId!,
  };
}

export function mapContactDtoToUpdateData(
  dto: UpdateContactRequestDto,
): IUpdateContact {
  return {
    firstname: dto.firstname,
    lastname: dto.lastname,
    email: dto.email,
    phone: dto.phone,
    profession: dto.profession,
  };
}

// =============================================================================
//                               SKILL
// =============================================================================

export function mapSkillDtoToCreateData(
  label: string,
  userId: number,
): TCreateSkill {
  return { label, createdBy: userId };
}
