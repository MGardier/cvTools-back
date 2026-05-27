# cvTools Backend — Project Conventions

## DTOs

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
