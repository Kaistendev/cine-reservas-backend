# Cine Reservas Backend

Sistema backend robusto para la reserva de boletos de cine. Incluye autenticación JWT con refresh tokens, control de concurrencia transaccional (overbooking prevention), roles de administrador/usuario, y reportes financieros.

## Stack

| Capa        | Tecnología                          |
|-------------|-------------------------------------|
| Runtime     | [Bun](https://bun.sh)               |
| Framework   | Express 5 + TypeScript              |
| ORM         | Drizzle ORM                         |
| DB          | PostgreSQL 16                       |
| Auth        | bcrypt + JWT (access + refresh)     |
| Validación  | Zod                                 |
| Testing     | Bun test + Supertest                |
| API Docs    | Swagger UI (OpenAPI 3.0)            |
| Infra dev   | Docker Compose                      |

## Setup

### 1. Clonar e instalar dependencias

```bash
bun install
```

### 2. Iniciar PostgreSQL

```bash
docker compose up -d
```

### 3. Configurar variables de entorno

Editar `.env` si es necesario:

```
DATABASE_URL=postgres://cineuser:cinepass@localhost:5433/cinereservas
JWT_SECRET=super-secret-key-change-in-production
PORT=3000
CORS_ORIGIN=*
```

### 4. Migraciones y seed

```bash
bun run db:setup
```

Esto ejecuta: `db:generate` → `db:migrate` → `db:seed`

### 5. Iniciar servidor

```bash
bun run dev
```

Servidor en `http://localhost:3000`.

## Seed Data

| Tipo    | Email              | Contraseña | Rol   |
|---------|--------------------|------------|-------|
| Admin   | admin@cine.com     | admin123   | ADMIN |
| Usuario | user@cine.com      | admin123   | USER  |

Incluye: 2 películas (Dune, Inception), 4 categorías, 2 salas con asientos, 2 funciones, y reservas de prueba.

## API Endpoints

### Auth

| Método | Ruta               | Auth     | Descripción                          |
|--------|--------------------|----------|--------------------------------------|
| POST   | `/auth/register`   | —        | Registrar nuevo usuario              |
| POST   | `/auth/login`      | —        | Iniciar sesión                       |
| POST   | `/auth/refresh`    | —        | Renovar access token con refresh token |
| GET    | `/me`              | Usuario  | Obtener perfil del usuario           |

Los endpoints de login/register devuelven:
- `accessToken` — JWT válido por 15 minutos
- `refreshToken` — JWT válido por 7 días

### Movies

| Método | Ruta               | Auth     | Descripción                          |
|--------|--------------------|----------|--------------------------------------|
| GET    | `/movies`          | —        | Listar películas (`?title=`, `?category=`, `?page=`, `?limit=`) |
| GET    | `/movies/:id`      | —        | Detalle de película                  |
| POST   | `/movies`          | ADMIN    | Crear película                       |
| PUT    | `/movies/:id`      | ADMIN    | Actualizar película                  |
| DELETE | `/movies/:id`      | ADMIN    | Eliminar película                    |

### Categories

| Método | Ruta               | Auth     | Descripción                          |
|--------|--------------------|----------|--------------------------------------|
| GET    | `/categories`      | —        | Listar categorías (`?page=`, `?limit=`) |
| GET    | `/categories/:id`  | —        | Detalle de categoría                 |
| POST   | `/categories`      | ADMIN    | Crear categoría                      |
| PUT    | `/categories/:id`  | ADMIN    | Actualizar categoría                 |
| DELETE | `/categories/:id`  | ADMIN    | Eliminar categoría                   |

### Screens

| Método | Ruta                       | Auth     | Descripción                          |
|--------|----------------------------|----------|--------------------------------------|
| GET    | `/screens`                 | —        | Listar salas                         |
| GET    | `/screens/:id`             | —        | Detalle de sala con asientos         |
| POST   | `/screens`                 | ADMIN    | Crear sala                           |
| PUT    | `/screens/:id`             | ADMIN    | Actualizar sala                      |
| DELETE | `/screens/:id`             | ADMIN    | Eliminar sala                        |
| POST   | `/screens/:id/seats`       | ADMIN    | Generar asientos (`{ rows, seatsPerRow }`) |

### Showtimes

| Método | Ruta                       | Auth     | Descripción                          |
|--------|----------------------------|----------|--------------------------------------|
| GET    | `/showtimes`               | —        | Listar funciones (`?movie_id=`, `?date=`, `?page=`, `?limit=`) |
| GET    | `/showtimes/:id`           | —        | Detalle de función                   |
| GET    | `/showtimes/:id/seats`     | —        | Asientos con disponibilidad          |
| POST   | `/showtimes`               | ADMIN    | Crear función                        |
| PUT    | `/showtimes/:id`           | ADMIN    | Actualizar función                   |
| DELETE | `/showtimes/:id`           | ADMIN    | Eliminar función                     |

### Reservations

| Método | Ruta                       | Auth     | Descripción                          |
|--------|----------------------------|----------|--------------------------------------|
| POST   | `/reservations`            | Usuario  | Crear reserva (transaccional, evita overbooking) |
| GET    | `/reservations`            | Usuario  | Historial del usuario                |
| PATCH  | `/reservations/:id/cancel` | Usuario  | Cancelar reserva (solo futuras, solo dueño) |

### Admin

| Método | Ruta                       | Auth     | Descripción                          |
|--------|----------------------------|----------|--------------------------------------|
| GET    | `/admin/reservations`      | ADMIN    | Todas las reservas (`?page=`, `?limit=`) |
| GET    | `/admin/reports/revenue`   | ADMIN    | Ingresos totales (`?from=`, `?to=`)  |
| GET    | `/admin/reports/occupancy` | ADMIN    | % ocupación (`?movie_id=`, `?from=`, `?to=`) |
| GET    | `/admin/reports/movies/:id`| ADMIN    | Reporte detallado por película       |

### Health

| Método | Ruta      | Descripción                     |
|--------|-----------|---------------------------------|
| GET    | `/health` | Health check del servidor       |

## Documentación Swagger

La API está documentada con OpenAPI 3.0:

- **UI:** `http://localhost:3000/api-docs/`
- **JSON:** `http://localhost:3000/api-docs.json`

## Control de Concurrencia

El overbooking se previene mediante:

1. **Unique constraint** en `reserved_seats(showtime_id, seat_id)` a nivel BD
2. **Transacciones atómicas** con `SELECT ... FOR UPDATE`
3. **Verificación explícita** de conflictos antes de insertar

## Autenticación

- El access token expira en 15 minutos
- Usar `POST /auth/refresh` con el refresh token para obtener uno nuevo
- Incluir en headers: `Authorization: Bearer <accessToken>`
- El refresh token expira en 7 días

## Pruebas

```bash
bun test
```

Requiere la base de datos corriendo con seed aplicado.

## Docker

### Desarrollo (solo DB)

```bash
docker compose up -d postgres
```

### Producción (app + DB)

```bash
docker compose up -d --build
```

## Scripts

| Comando            | Descripción                         |
|--------------------|-------------------------------------|
| `bun run dev`      | Iniciar servidor en modo desarrollo |
| `bun run start`    | Iniciar servidor en producción      |
| `bun run db:generate` | Generar migraciones              |
| `bun run db:migrate`  | Aplicar migraciones              |
| `bun run db:seed`     | Sembrar datos de prueba          |
| `bun run db:setup`    | Generate + migrate + seed        |
| `bun test`         | Ejecutar tests (86)              |
| `bun run lint`     | ESLint type-checked              |
