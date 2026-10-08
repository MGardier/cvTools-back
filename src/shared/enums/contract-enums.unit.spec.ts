import { UserRoles, UserStatus } from '#prisma/generated/client.js';
import { userRoleSchema, userStatusSchema } from '@cvtools/contracts';

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
});
