# Cine Reservas Backend

## Commands
- `bun dev` — start dev server with hot reload
- `bun test` — run tests (46 tests)
- `bun run db:setup` — generate migrations + migrate + seed
- `bun run lint` — ESLint type-checked linting

## Architecture (MVC)
- `src/models/` — re-exports Drizzle schemas
- `src/repositories/` — data access layer (7 files)
- `src/services/` — business logic (7 files)
- `src/controllers/` — request/response handling (7 files)
- `src/routes/` — thin route definitions with middleware (7 files)
- `src/middleware/` — auth, rbac, validate, error-handler

## Tech Stack
- **Runtime:** Bun
- **Framework:** Express + TypeScript
- **ORM:** Drizzle ORM 0.45
- **DB:** PostgreSQL (Docker Compose)
- **Auth:** bcrypt + jsonwebtoken
- **Validation:** Zod 4
- **Testing:** Bun test + Supertest

## Sprints
- Sprint 1-6: Completados (auth, CRUD, reservas, reportes, tests)
- Sprint 7: Seguridad (helmet, CORS, rate-limit, env validation) — **actual**
- Sprint 8: Logging, paginación, validación total
- Sprint 9: Tests faltantes e integración
- Sprint 10: Swagger, refresh tokens, Dockerfile, admin reservations

## Project Files
- `src/db/schema.ts` — Drizzle table definitions
- `src/db/index.ts` — Drizzle client
- `src/lib/app-error.ts` — AppError class
- `src/middleware/auth.ts` — JWT authentication
- `src/middleware/rbac.ts` — Role authorization
- `src/middleware/validate.ts` — Zod validation middleware
- `src/middleware/error-handler.ts` — Global error handler
- `tests/` — 8 test files, 46 tests total
- `plan-desarrollo.md` — Full development plan

## Conventions
- Controllers never touch the DB; services never touch HTTP
- Routes only define method + middleware + controller binding
- All business logic in services, all queries in repos
- Use `const [x] = await ...returning()` with `x!` assertion
- Prefer arrow functions for controller/service/repo objects
