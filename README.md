<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


### Package Manager

This project uses **pnpm** as the package manager. All commands should use `pnpm` instead of `npm` or `yarn`.


## Project setup

```bash
$ pnpm install
```

### API contracts (`@cvtools/contracts`)

The typed HTTP routes are defined in the shared contract package `env-cvTools/contracts`
(oRPC + Zod), consumed through `"@cvtools/contracts": "file:../../contracts"`.
This repository must therefore be cloned inside `env-cvTools` (`env-cvTools/cvTools/back`).

> ⚠️ pnpm **copies** a `file:` dependency into `node_modules` (no symlink).
> After **every change to the contract**, rebuild it and reinstall here:
>
> ```bash
> cd ../../contracts && pnpm build
> cd - && pnpm install
> ```
>

## DevOps — Docker

The `docker-compose.yml` exposes two profiles:

- **`dev`**: `api-postgres`, `ms-postgres`, `rabbitmq`, `redis`, `pgadmin`, `mailpit`
- **`test`**: `test-postgres`, `redis`

```bash
# Start the dev stack in the background
$ docker compose --profile dev up -d

# Stop the dev stack (keeps volumes and data)
$ docker compose --profile dev down

# Stop the dev stack and remove named volumes (full data reset)
$ docker compose --profile dev down -v
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Development Conventions

### Project Structure

```
src/
├── main.ts / app.module.ts     # Bootstrap + root module (global guard, filter, interceptors)
├── cli.ts                      # CLI entry point (nest-commander)
│
├── app/                        # Technical infrastructure (framework wiring)
│   ├── cli/                    # CLI commands (create-admin)
│   ├── config/                 # Env validation (Zod schema)
│   ├── exceptions/             # Custom exceptions (OAuthRedirectException)
│   ├── filters/                # Exception filters (global, HTTP, Prisma) + FiltersModule
│   ├── guards/                 # Auth guards (JWT, refresh, credentials, OAuth, throttler)
│   ├── interceptors/           # Response envelope + serialization (classic routes)
│   ├── orpc/                   # oRPC wiring: OrpcModule, ContractErrorBoundary, context types
│   ├── pipes/                  # Custom pipes
│   └── strategies/             # Passport strategies (local, JWT, refresh, Google, GitHub)
│
├── modules/                    # Business modules (one folder per domain)
│   ├── auth/                   # Contract routes (oRPC) + OAuth redirects
│   │   ├── jwt-manager/        # Sub-domain: JWT signing / verification (+ its types.ts)
│   │   ├── user-token/         # Sub-domain: refresh / confirm / reset tokens (+ its types.ts)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts      # Single module: also provides the sub-domain services
│   │   └── types.ts
│   ├── offer/                  # Classic routes: class-validator DTOs
│   │   ├── dto/
│   │   │   ├── request/        # Input DTOs (validation of request)
│   │   │   └── response/       # Output DTOs (serialization of response)
│   │   ├── providers/
│   │   ├── offer.controller.ts
│   │   ├── offer.service.ts
│   │   ├── offer.module.ts
│   │   └── types.ts
│   ├── user/                   # No controller: service + repository
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.module.ts
│   │   └── types.ts
│   ├── admin/                  # Admin registration (+ admin-invitation/ sub-domain, no own module)
│   ├── city/  scraper/  llm/  email/
│   └── cache/  rabbitmq/  provider/  health/
│
└── shared/                     # Reusable building blocks (no framework wiring)
    ├── constants/              # Cross-module constants
    ├── decorators/             # @Public(), @SerializeWith(), @SkipSerialize()
    ├── dto/                    # Cross-module DTOs (pagination, params options)
    ├── enums/                  # ErrorCodeEnum, DtoErrorCodeEnum (re-exported from the contract)
    ├── types/                  # Thematic shared types (api, auth, request, repository...)
    └── utils/                  # Helpers: abstract classes with static methods

prisma/                         # Schema, migrations, PrismaService
test/                           # Integration / e2e tests + setup helpers
```

**Import aliases** (Node.js subpath imports, `imports` field of `package.json`):
`#app/*`, `#shared/*`, `#modules/*` (and `#src/*` for files at the root of `src/`, `#prisma/*`).
Always prefer an alias over a `../` relative path across folders, e.g.
`import { Hash } from '#shared/utils/hash.js';`.

API contracts (routes, schemas, error codes) live outside this repository, in
`env-cvTools/contracts` (`@cvtools/contracts`).

---

### Layer Rules

|Layer|File|Does|Does NOT|
|---|---|---|---|
|**Controller**|`*.controller.ts`|Route handling, call service, return response|Business logic, DB queries|
|**Service**|`*.service.ts`|Business logic, orchestration, call repository|HTTP concerns, direct ORM calls|
|**Repository**|`*.repository.ts`|Database operations only|Business rules|
|**Types**|`types.ts`|Define interfaces and types for the module|Contain implementation|

---

### Code Flow

```
Request → Controller → Service → Repository → Database
                ↓           ↓
     Contract / DTO      Interface
```

**Controller** receives the validated input (contract schema for oRPC routes, DTO for classic routes), calls Service.
**Service** contains logic, uses Repository through Interface.
**Repository** implements Interface, talks to database.

---

### Naming Conventions

```
user.controller.ts        # Controller
user.service.ts           # Service
user.repository.ts        # Repository implementation
types.ts                  # Module types/interfaces

jwt-auth.guard.ts         # Guard
logging.interceptor.ts    # Interceptor
validation.pipe.ts        # Pipe
sign-in.dto.ts            # DTO
```

---

### Contract routes (oRPC)

Routes declared in `@cvtools/contracts` (auth, admin, city) are implemented with `@Implement`:

```ts
@Controller() // no prefix: the contract carries the full path
export class CityController {
  @Public()
  @Implement(contract.city.search)
  search() {
    return implement(contract.city.search).handler(async ({ input, context }) =>
      ContractRoute.buildSuccessResponse(contract.city.search, await this.cityService.search(input), context.request),
    );
  }
}
```

- **Input** is validated by the contract schema (no DTO, no `ValidationPipe`).
- **Output** is validated and stripped by the contract schema (no `@SerializeWith`).
- `ContractRoute.buildSuccessResponse(procedure, data, request)` (`src/shared/utils/contract-route.ts`) builds the success envelope; the status comes from the contract `successStatus`.
- Guards (`@Public`, `@UseGuards`, `@Throttle`) work as usual. Use `@Req()` / `@Res({ passthrough: true })` for `req.user` and cookies.
- Errors thrown in a handler are mapped and logged by `GlobalExceptionFilter.logAndMapError()` (`ContractErrorBoundary`, `src/app/orpc/contract-error-boundary.ts`).

**Error format** (every route, contract or not):

```json
{ "defined": false, "code": "USER_NOT_FOUND_ERROR", "status": 404, "message": "USER_NOT_FOUND_ERROR",
  "data": { "errors": ["EMAIL_INVALID"], "path": "/auth/signUp", "timestamp": "..." } }
```

`errors` is only present for validation errors (`code: VALIDATION_ERROR`).

OAuth redirect routes, `/health`, `offer` and `scraper` stay classic Nest routes (DTOs below).

### DTOs  Conventions

#### Naming Conventions 
- **Classes Request** : PascalCase +  `RequestDto` (ex: `SignInRequestDto`)
- **Classes Response** : PascalCase +  `ResponseDto` (ex: `SignInResponseDto`)



---

### Typing Conventions

**Required prefixes:**
- `I` for interfaces: `ICreateUser`, `IApiResponse`, `IOptionRepository`
- `T` for types: `TSortItem`, `TFilterOptions`

**File organization:**

| Location | Purpose | Examples |
|----------|---------|----------|
| `src/modules/*/types.ts` | Module-specific interfaces/types | `ICreateUser`, `IUpdateJob`, `ISignInOutput` |
| `src/shared/types/api.types.ts` | API-related shared types | `IApiResponse`, `IErrorDescriptor`, `ILogContext` |
| `@cvtools/contracts` | Contract request / response types | `TSignUpBody`, `TUser`, `TContractOutputs` |


**Rules:**
- One `types.ts` file per module containing ALL module interfaces/types
- Shared types go in `shared/types/` grouped by theme
- Contract routes use the types inferred from `@cvtools/contracts` (never redeclared)
- No "Interface" or "Type" suffix in names (the I/T prefix is sufficient)

**Examples:**
```typescript
import { ICreateUser } from './types';
import { TSortItem } from '#shared/types/repository.types.js';
```

---

### Architecture Guidelines

#### `app/` - Technical Infrastructure
Framework wiring applied globally or to routes: everything Nest/Passport/oRPC-specific.

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `cli/` | CLI commands | `create-admin.command.ts` |
| `config/` | Environment validation | `env.schema.ts`, `env.validation.ts` |
| `exceptions/` | Custom exceptions | `OAuthRedirectException` |
| `filters/` | Exception filters (error format, logging) | `GlobalExceptionFilter`, `HttpExceptionFilter`, `PrismaClientExceptionFilter` |
| `guards/` | Authentication / rate limiting | `JwtAuthGuard`, `JwtRefreshGuard`, `GoogleOauthGuard`, `CustomThrottlerGuard` |
| `interceptors/` | Response transformation (classic routes) | `ResponseInterceptor`, `SerializeInterceptor` |
| `orpc/` | oRPC contract routes wiring | `OrpcModule`, `ContractErrorBoundary` |
| `pipes/` | Validation & transformation | `custom-sort-fields-validator.ts` |
| `strategies/` | Passport strategies | `JwtAccessStrategy`, `LocalStrategy`, `GoogleStrategy` |

#### `shared/` - Reusable Building Blocks
Code used by 2+ modules, without framework wiring.

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `constants/` | Cross-module constants | `url.constant.ts` |
| `decorators/` | Custom decorators | `@Public()`, `@SerializeWith()`, `@SkipSerialize()` |
| `dto/` | Cross-module DTOs | `pagination.dto.ts`, `params-options.dto.ts` |
| `enums/` | Error codes (from the contract) + Prisma error codes | `error-codes.enum.ts`, `dto-error-codes.enum.ts` |
| `types/` | Shared type definitions (thematic) | `api.types.ts`, `request.types.ts`, `repository.types.ts` |
| `utils/` | Helpers (abstract class with static methods, no `Util` prefix) | `Hash`, `OAuth`, `ErrorResponse`, `ContractRoute` |

**Rules:**
- Used by a single module → inside that module (a sub-domain becomes a sub-folder of its parent
  module, without its own `*.module.ts`: its providers are declared in the parent module, e.g.
  `auth/user-token/`, `auth/jwt-manager/`, `admin/admin-invitation/`).
- Framework wiring (guard, filter, interceptor, strategy, pipe) → `app/`.
- Reusable, framework-agnostic code used by 2+ modules → `shared/`.

---

### Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat: add JWT authentication
fix: resolve null pointer in getUserById
docs: update installation instructions
refactor: simplify error handling logic
```

---

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
