# cvTools Backend — Project Conventions

## Contract routes (oRPC)

Routes declared in `@cvtools/contracts` (`env-cvTools/contracts`) are implemented with
`@Implement(contract.x)` + `implement(contract.x).handler(...)` and return `ContractRoute.buildSuccessResponse(contract.x, data, request)`.
Never add a DTO, `@Body`/`@Query` or `@SerializeWith` on a contract route: the contract schemas
validate the input and strip the output. Controllers holding contract routes use `@Controller()`
(no prefix). Validation messages in the contract are error codes (`DtoErrorCode`), never text.

After any change to the contract: `pnpm build` in `env-cvTools/contracts`, then `pnpm install` here.

## Imports

Use the Node.js subpath import aliases (`package.json` → `imports`): `#app/*`, `#shared/*`,
`#modules/*`, `#prisma/*`, and `#src/*` only for files at the root of `src/` (e.g. `app.module.ts`).
Never use a `../` relative path to reach another top-level folder. Keep the `.js` extension (ESM nodenext).

## Utils

Shared helpers live in `src/shared/utils/<name>.ts` (no sub-folder), as an
**abstract class with static methods** whose name does not contain `Util`
(e.g. `Hash.compare()`, `OAuth.buildRedirectUrl()`, `ErrorResponse.send()`, `ContractRoute.buildSuccessResponse()`).

## DTOs (classic routes only: offer, scraper, OAuth)

All DTO class properties must use the **definite assignment assertion** (`!`)
between the property name and the colon.

```ts
export class ExampleResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;
}
```

Why: without `!`, `strictPropertyInitialization` raises
`Property 'x' has no initializer and is not definitely assigned in the constructor`.
DTOs are populated by `class-transformer` (not via a constructor), so the assertion
tells TypeScript that the property will be assigned externally.

Applies to every property of every Request and Response DTO, including nested DTOs.

## Types & Interfaces

**Never declare types or interfaces inline** in a `*.service.ts`, `*.repository.ts`
or `*.controller.ts` file. They must live in the module's `types.ts` file and be
imported where needed.

Naming reminder: types use the `T` prefix (`THomeCountCategory`), interfaces use
the `I` prefix (`ICreateUser`).

```ts
// ❌ user.service.ts
type THomeCountCategory = 'inProgress' | 'toApply' | ...;

// ✅ user/types.ts
export type THomeCountCategory = 'inProgress' | 'toApply' | ...;

// ✅ user.service.ts
import { THomeCountCategory } from './types';
```

## Durations & millisecond values

Any numeric value expressed in **milliseconds** (durations, timeouts, TTLs,
cookie `maxAge`, expirations, etc.) must carry an inline comment giving its
human-readable equivalent, so the raw number is immediately understandable:

- **< 1 hour** → express in **minutes**
- **≥ 1 hour** → express in **hours**

```ts
maxAge: 600000, // 10 minutes
ttl: 60_000,    // 1 minute
JWT_REFRESH_EXPIRATION: 604800000, // 168 hours (7 days)
```

## Constants

- If a constant is used by **a single method**, declare it **inside that method**.
- If a constant is used by **two or more methods or files** in a module,
  declare it in a `constants.ts` file at the module's root and import it.

```ts
// ✅ single-use → inside the method
async getHomeData(userId: number) {
  const RECENT_LIMIT = 3;
  ...
}

// ✅ multi-use → module-scoped constants file
// user/constants.ts
export const RECENT_LIMIT = 3;
```
