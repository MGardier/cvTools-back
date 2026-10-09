import {
  LoginMethod,
  UserRoles,
  UserStatus,
} from '#prisma/generated/client.js';
import {
  oauthLoginMethodSchema,
  userRoleSchema,
  userStatusSchema,
} from '@cvtools/contracts';

// The contract (@cvtools/contracts) mirrors Prisma enums exposed by the API:
// a schema change must be reflected in the contract.
describe('Contract enums ↔ Prisma enums', () => {
  it('UserRole matches Prisma UserRoles', () => {
    expect([...userRoleSchema.options].sort()).toEqual(
      Object.values(UserRoles).sort(),
    );
  });

  it('UserStatus matches Prisma UserStatus', () => {
    expect([...userStatusSchema.options].sort()).toEqual(
      Object.values(UserStatus).sort(),
    );
  });

  it('OAuthLoginMethod values all exist in Prisma LoginMethod', () => {
    const prismaValues: string[] = Object.values(LoginMethod);
    for (const method of oauthLoginMethodSchema.options) {
      expect(prismaValues).toContain(method);
    }
  });
});
