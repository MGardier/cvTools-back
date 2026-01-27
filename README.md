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
├── modules/
│   ├── user/
│   │   ├── dto/
|   |      ├── request/    # Input DTOs (validation of request)
|   |      └── response/   # Output DTOs (serialisation of response)
│   │   ├── types.ts              
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.module.ts
│   │
│   ├── auth/
│   ├── job/
│   ├── technology/
│   └── ...

├── common/
│   ├── dto/
│   ├── exceptions/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── config/
│   ├── types/                    
│   │   ├── api.types.ts          
│   │   └── repository.types.ts    
│   ├── enums/
│   └── utils/
│
├── app.module.ts
└── main.ts
```

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
              DTO      Interface
```

**Controller** receives DTO, calls Service.
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
| `src/common/types/api.types.ts` | API-related shared types | `IApiResponse`, `ILogContext` |


**Rules:**
- One `types.ts` file per module containing ALL module interfaces/types
- Shared types go in `common/types/` grouped by theme
- No "Interface" or "Type" suffix in names (the I/T prefix is sufficient)

**Examples:**
```typescript
import { ICreateUser } from './types';
import { IFilterOptions } from 'src/common/types/repository.types';
```

---

### Architecture Guidelines

#### `common/` - Technical Infrastructure
Contains cross-cutting technical concerns used by 2+ modules.

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `decorators/` | Custom decorators | `@Public()`, `@CurrentUser()`, `@Roles()` |
| `exceptions/` | Global exception filters | `GlobalExceptionFilter`, Custom exceptions |
| `guards/` | Authentication/Authorization | `JwtAuthGuard`, `RolesGuard` |
| `interceptors/` | Request/Response transformation | `LoggingInterceptor`, `TransformInterceptor` |
| `pipes/` | Validation & transformation | Custom validation pipes |
| `config/` | Application configuration | Environment validation, schemas |
| `types/` | Shared type definitions (thematic) | `api.types.ts`, `repository.types.ts` |
| `dto/` | Cross-module DTOs | `params-options.dto.ts` |
| `enums/` | Business enums | `error-codes.enum.ts`, `status.enum.ts` |
| `utils/` | Business utilities | `util-repository.ts`, `util-date.ts` |

**Rule:** If it's used by multiple modules → `common/`


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
