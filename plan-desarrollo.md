# Movie Ticket Reservation Backend

## 1. Project Overview

Sistema backend robusto para la reserva de boletos de cine. El enfoque principal no es un simple CRUD, sino la resolución de lógicas de negocio complejas, control de concurrencia transaccional, diseño de base de datos relacional y autorización basada en roles (RBAC).

## 2. Core Features & Business Rules

**Auth & RBAC:** Autenticación de usuarios (JWT). Dos roles: `ADMIN` y `USER`. Solo los administradores pueden gestionar la cartelera, ver reportes financieros y otorgar permisos de administrador.

**Movie Management:** Catálogo de películas categorizadas por múltiples géneros (relación N:M). Asignación de películas a funciones (showtimes) en salas específicas (screens).

**Seat Reservation (Core Logic):** Los usuarios pueden ver la disponibilidad de asientos en tiempo real para una función y realizar reservas. Las cancelaciones de reservas futuras están permitidas.

**Reporting:** Agregación de datos financieros y de capacidad (ingresos totales, porcentaje de ocupación) accesibles solo por administradores.

## 3. Database Schema Architecture (Relacional — PostgreSQL)

El modelo está normalizado para evitar redundancias e inconsistencias.

- **users:** `id`, `email`, `password_hash`, `role` (`'ADMIN'` | `'USER'`).
- **movies:** `id`, `title`, `description`, `poster_url`, `duration_minutes`.
- **categories:** `id`, `name`.
- **movie_categories** (Pivote): `movie_id`, `category_id` (Primary Key compuesta).
- **screens** (Salas): `id`, `name`, `total_capacity`.
- **seats** (Asientos Físicos): `id`, `screen_id`, `row_letter`, `seat_number`. Unique constraint: (`screen_id`, `row_letter`, `seat_number`).
- **showtimes** (Funciones): `id`, `movie_id`, `screen_id`, `start_time`, `ticket_price`.
- **reservations:** `id`, `user_id`, `showtime_id`, `status` (`'ACTIVE'` | `'CANCELLED'`), `total_amount`, `created_at`.
- **reserved_seats** (Asientos Ocupados): `id`, `reservation_id`, `showtime_id`, `seat_id`, `price_paid`.

## 4. Technical Challenges & Architectural Decisions

**Concurrency Control (Overbooking Prevention):** Delegado a la base de datos mediante un `UNIQUE CONSTRAINT` en la tabla `reserved_seats` para las columnas (`showtime_id`, `seat_id`). Las peticiones de reserva deben ejecutarse dentro de **Transacciones Atómicas** (Commit/Rollback) y manejar el error de violación de restricción única para notificar al cliente con `409 Conflict`.

**Dynamic Seat Mapping:** Para calcular asientos disponibles, se cruza la tabla `seats` (pertenecientes a la sala de la función) restando aquellos presentes en `reserved_seats` para ese `showtime_id` con estado `'ACTIVE'`.

**Indexing Strategy:**

- Índices automáticos en Primary Keys y Unique Constraints.
- Índices explícitos agregados a las Foreign Keys (`movie_id`, `screen_id`, `user_id`) para optimizar JOINs.
- Índices en columnas de filtrado frecuente: `showtimes.start_time` (búsqueda por fecha) y `movies.title` (barra de búsqueda).
- Evitar sobre-indexación en la tabla `reserved_seats` para mantener alta velocidad de escritura (INSERTs) durante transacciones concurrentes.

## 5. Stack Tecnológico

| Capa        | Tecnología                     |
|-------------|--------------------------------|
| Runtime     | Bun                            |
| Framework   | Express + TypeScript           |
| ORM         | Drizzle (ligero, type-safe)    |
| DB          | PostgreSQL                     |
| Auth        | bcrypt + jsonwebtoken          |
| Validación  | Zod                            |
| Testing     | Bun test + Supertest           |
| Infra dev   | Docker Compose                 |

## 6. Plan de Desarrollo por Sprints

### Sprint 1 — Proyecto Base, DB y Auth (Días 1–3)

- Inicializar proyecto con `bun init`, instalar Express, TypeScript, Drizzle ORM, bcrypt, jsonwebtoken
- Configurar Docker Compose para PostgreSQL
- Definir esquemas de base de datos: `users`, `movies`, `categories`, `movie_categories`, `screens`, `seats`, `showtimes`, `reservations`, `reserved_seats`
- Crear migraciones y seed básico
- Implementar auth: `POST /auth/register`, `POST /auth/login`, middleware JWT
- RBAC: middleware `authorize('ADMIN')`

**Entregable:** Servidor corriendo, DB con migrations, auth funcional con roles.

---

### Sprint 2 — Módulo de Películas y Catálogo (Días 4–5)

- CRUD de películas (solo ADMIN) — `movies`
- CRUD de categorías (solo ADMIN) — `categories`
- CRUD de salas y asientos (solo ADMIN) — `screens`, `seats`
- Endpoints públicos: `GET /movies`, `GET /movies/:id` (con categorías)
- Filtros por título, género, fecha

**Entregable:** Admin puede gestionar cartelera; usuario puede ver películas con filtros.

---

### Sprint 3 — Funciones y Disponibilidad (Días 6–7)

- CRUD de funciones (solo ADMIN) — `showtimes`
- Endpoint público: `GET /showtimes?movie_id=&date=` con sala y precio
- Endpoint `GET /showtimes/:id/seats` — devuelve asientos con estado (`available` / `reserved`)
- Lógica de seat mapping dinámico (LEFT JOIN seats con reserved_seats)

**Entregable:** Usuario puede consultar funciones y ver disponibilidad en tiempo real.

---

### Sprint 4 — Reservas y Control de Concurrencia (Días 8–10)

- `POST /reservations` — crear reserva:
  - Transacción atómica
  - INSERT en `reservations` + INSERT batch en `reserved_seats`
  - Capturar error `UNIQUE constraint` (`showtime_id`, `seat_id`) → `409 Conflict`
  - Calcular `total_amount` en backend
- `GET /reservations` — historial del usuario autenticado
- `PATCH /reservations/:id/cancel` — cancelación (solo futuras, solo dueño)
- Índices explícitos en FKs y columnas de búsqueda

**Entregable:** Usuario puede reservar, ver historial y cancelar; overbooking prevenido por BD.

---

### Sprint 5 — Reportes Financieros (Días 11–12)

- Endpoints solo ADMIN:
  - `GET /admin/reports/revenue` — ingresos totales por rango de fechas
  - `GET /admin/reports/occupancy` — % ocupación por función/película/sala
  - `GET /admin/reports/movies/:id` — detalle financiero por película
- Agregaciones SQL con `SUM`, `COUNT`, `GROUP BY`

**Entregable:** Admin dashboard con datos financieros y de ocupación.

---

### Sprint 6 — Testing, Documentación y Polish (Días 13–15)

- Tests unitarios e integrales con Bun test + Supertest
- Validación con Zod para todos los inputs
- Manejo global de errores
- Documentación de API (README o endpoints list)
- Script de seed completo
- README con instrucciones de setup

**Entregable:** Proyecto listo para producción con tests, validación y docs.

---

### Sprint 7 — Seguridad y Configuración (Días 16–17)

- Validar variables de entorno en startup (`DATABASE_URL`, `JWT_SECRET`) con Zod
- `helmet` para headers de seguridad HTTP
- Configurar CORS explícitamente (origen permitido por `CORS_ORIGIN` env)
- Rate limiting (`express-rate-limit`) en auth y creación de reservas

**Entregable:** Servidor hardening contra ataques comunes.

---

### Sprint 8 — Logging, Paginación y Validación Total (Días 18–19)

- `morgan` para logging HTTP
- `GET /health` endpoint de health check
- Zod schemas de validación para **todos** los endpoints (body, params, query)
- Paginación (`page`, `limit`) en `GET /movies`, `GET /showtimes`, `GET /categories`

**Entregable:** Cada endpoint validado, trazabilidad HTTP, endpoints paginados.

---

### Sprint 9 — Tests Faltantes (Días 20–21)

- Tests del error handler (`AppError`, `error-handler.ts`)
- Tests del `validate` middleware (Zod rejection)
- Tests de casos borde en cada controlador (body inválido, missing params)
- Tests de integración: flujo completo crear sala → generar asientos → crear función → reservar → cancelar

**Entregable:** Cobertura de tests > 80% en middleware y controladores.

---

### Sprint 10 — Documentación y Features Finales (Días 22–24)

- Documentación OpenAPI/Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- Refresh tokens para auth
- `Dockerfile` y `docker-compose.yml` propios dentro del repo
- `GET /admin/reservations` — admin ve todas las reservas

**Entregable:** API documentada, deployable con Docker, auth con refresh, admin puede ver todas las reservas.
