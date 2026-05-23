# Cine Reservas Backend

## Commands
- `bun dev` — start dev server with hot reload
- `bun test` — run tests (86 tests)
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
- **API Docs:** Swagger (OpenAPI 3.0) via swagger-jsdoc + swagger-ui-express

## Sprints
- Sprint 1-6: Completados (auth, CRUD, reservas, reportes, tests)
- Sprint 7: Seguridad (helmet, CORS, rate-limit, env validation)
- Sprint 8: Logging, paginación, validación total
- Sprint 9: Tests faltantes e integración
- Sprint 10: Swagger, refresh tokens, Dockerfile, admin reservations — **completado**

## Project Files
- `src/db/schema.ts` — Drizzle table definitions
- `src/db/index.ts` — Drizzle client
- `src/lib/app-error.ts` — AppError class
- `src/lib/env.ts` — environment validation with Zod
- `src/middleware/auth.ts` — JWT authentication
- `src/middleware/rbac.ts` — Role authorization
- `src/middleware/validate.ts` — Zod validation middleware
- `src/middleware/error-handler.ts` — Global error handler
- `src/docs/swagger.ts` — OpenAPI 3.0 specification
- `tests/` — 13 test files, 86 tests total
- `plan-desarrollo.md` — Full development plan

## Conventions
- Controllers never touch the DB; services never touch HTTP
- Routes only define method + middleware + controller binding
- All business logic in services, all queries in repos
- Use `const [x] = await ...returning()` with `x!` assertion
- Prefer arrow functions for controller/service/repo objects
- Import types from Express with `type` keyword
- Use `AppError` class for all controlled errors
- Validate all inputs (body, params, query) with Zod schemas

## API Overview

### Public Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (returns accessToken + refreshToken) |
| POST | `/auth/refresh` | Renew access token |
| GET | `/me` | Current user profile |
| GET | `/health` | Health check |
| GET | `/movies` | List movies (paginated, filterable) |
| GET | `/movies/:id` | Movie detail |
| GET | `/categories` | List categories (paginated) |
| GET | `/categories/:id` | Category detail |
| GET | `/screens` | List screens |
| GET | `/screens/:id` | Screen with seats |
| GET | `/showtimes` | List showtimes (paginated, filterable) |
| GET | `/showtimes/:id` | Showtime detail |
| GET | `/showtimes/:id/seats` | Seat availability |

### Protected Endpoints (USER)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/reservations` | Create reservation |
| GET | `/reservations` | User reservation history |
| PATCH | `/reservations/:id/cancel` | Cancel reservation |

### Protected Endpoints (ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/movies` | Create movie |
| PUT | `/movies/:id` | Update movie |
| DELETE | `/movies/:id` | Delete movie |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/screens` | Create screen |
| PUT | `/screens/:id` | Update screen |
| DELETE | `/screens/:id` | Delete screen |
| POST | `/screens/:id/seats` | Generate seats |
| POST | `/showtimes` | Create showtime |
| PUT | `/showtimes/:id` | Update showtime |
| DELETE | `/showtimes/:id` | Delete showtime |
| GET | `/admin/reservations` | All reservations (paginated) |
| GET | `/admin/reports/revenue` | Revenue report |
| GET | `/admin/reports/occupancy` | Occupancy report |
| GET | `/admin/reports/movies/:id` | Movie financial detail |

Swagger UI available at `/api-docs`.
