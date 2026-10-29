# Plan para añadir un frontend (React + Tailwind CSS + Material UI)

El backend ya está completo (Sprint 10). El objetivo es crear una aplicación web que consuma esta API REST, con dos áreas: cliente (público/usuario) y panel de administración.

## 1. Decisión de estructura (repositorio)

Tienes dos opciones. Mi recomendación: **monorepo** para desarrollo inicial.

| Opción | Ventajas | Desventajas |
|---|---|---|
| **Monorepo** (`/frontend` junto a `/src`) | Más fácil compartir tipos (puedes extraer tipos de la API), mismo repo, un solo `git`, dev simultáneo. | Crece el repo, estructura menos "limpia" si luego se separan. |
| **Repo separado** (`cine-reservas-frontend`) | Más limpio, independiente, se puede desplegar por separado. | Hay que mantener tipos sincronizados manualmente o con un paquete compartido. |

**Recomendado:** Empezar en `frontend/` dentro del mismo repo (`cine-reservas-backend/frontend/`). Añadir scripts al `package.json` raíz con `concurrently` o usar workspaces de Bun si lo prefieres.

## 2. Stack frontend propuesto

| Tecnología | Uso | Razón |
|---|---|---|
| **[Vite](https://vitejs.dev/)** | Build tool / dev server | Rápido, moderno, integración sencilla con React+TS. |
| **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** | UI | Ya lo indicas, tipado fuerte. |
| **[React Router v7](https://reactrouter.com/)** | Routing | SPA con rutas públicas/privadas, guardias por rol. |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utilidades CSS | Rápido para layout/spacing. Úsalo para estructura, espaciados, responsive. |
| **[Material UI (MUI) v7](https://mui.com/)** | Componentes complejos | Formularios, tablas, diálogos, snackbars, date/time pickers. Combínalo con Tailwind (MUI con `sx` o clases). |
| **[TanStack Query (React Query)](https://tanstack.com/query)** | Data fetching/cache | Ideal para consumir REST, invalidación tras crear/editar/cancelar, estados de carga/error. |
| **[Axios](https://axios-http.com/)** | Cliente HTTP | Interceptores para `accessToken`, refresh automático en 401. |
| **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** | Formularios + validación | Coherente con validación del backend. |
| **[date-fns](https://date-fns.org/)** o **[dayjs](https://day.js.org/)** | Fechas/horas | Mostrar funciones, formatos legibles. |
| **[Sonner](https://sonner.emilkowal.ski/)** o **notistack** | Notificaciones | Feedback al usuario (reserva exitosa, errores). |

## 3. Arquitectura frontend

Sigue una arquitectura modular, por features. Esto escala bien y se integra con la filosofía del backend.

```
frontend/
├── public/
├── src/
│   ├── app/                # Router, providers (QueryClient, Theme, Auth)
│   ├── assets/             # Imágenes/logos
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/             # Wrappers MUI/Tailwind (Button, Input, etc.)
│   │   ├── layout/         # Navbar, Footer, Sidebar, Container
│   │   └── common/         # EmptyState, Loader, ErrorBoundary
│   ├── config/             # env, axios instance
│   ├── features/           # Módulos por dominio
│   │   ├── auth/           # login, register, auth context/hooks
│   │   ├── movies/         # cartelera, detalle película
│   │   ├── showtimes/      # funciones por película/sala
│   │   ├── seats/          # selector de butacas
│   │   ├── reservations/   # mis reservas, crear reserva
│   │   └── admin/          # panel admin (movies, screens, showtimes, reservations, reports)
│   ├── hooks/              # hooks generales (useAuth, useDebounce)
│   ├── lib/                # utils, helpers, constants
│   │   ├── api.ts          # axios + interceptores
│   │   ├── queryClient.ts  # tanstack query config
│   │   └── providers.tsx   # app providers
│   ├── routes/             # route guards (ProtectedRoute, AdminRoute)
│   ├── types/              # tipos compartidos (derivados de API)
│   └── styles/index.css    # tailwind directives + global styles
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Reglas:** 
- `features/` contiene páginas, componentes específicos, hooks y servicios por dominio.
- `components/` solo para componentes verdaderamente reutilizables entre features.
- Todo el acceso a API va por hooks de TanStack Query (ej. `useMovies`, `useCreateReservation`).

## 4. Integración con API (contratos clave)

Basándote en los endpoints del backend, define estos flujos.

### 4.1 Autenticación
| Acción | Endpoint | Notas |
|---|---|---|
| Registro | `POST /auth/register` | Guardar tokens en `localStorage`. Actualmente el backend devuelve tokens en body. |
| Login | `POST /auth/login` | Igual que registro. |
| Refresh | `POST /auth/refresh` | En interceptor 401: llamar `/auth/refresh`, guardar nuevo `accessToken`, reintentar request original. |
| Perfil | `GET /me` | Obtener usuario actual (usar para auth context). |

**AuthContext:** almacenar `user`, `accessToken`, `isAuthenticated`, `isAdmin`, `login`, `logout`, `refreshUser`.

### 4.2 Cartelera y funciones
| Endpoint | Uso |
|---|---|
| `GET /movies` | Listado con paginación/filtrado (query params). Cartelera con posters. |
| `GET /movies/:id` | Detalle película + funciones disponibles. |
| `GET /showtimes` | Filtrar por película/fecha/sala. |
| `GET /showtimes/:id` | Detalle función. |
| `GET /showtimes/:id/seats` | **Crítico:** obtener butacas disponibles/tomadas. |

### 4.3 Reservas (usuario)
| Endpoint | Uso |
|---|---|
| `POST /reservations` | Crear reserva: `{ showtimeId, seatIds: string[] }`. Usa `reservationLimiter` en backend, pero frontend debe controlar UX. |
| `GET /reservations` | Mis reservas (histórico). Mostrar estado (PENDING/CONFIRMED/CANCELED). |
| `PATCH /reservations/:id/cancel` | Cancelar reserva. |

### 4.4 Admin
| Endpoint | Uso |
|---|---|
| `POST /movies`, `PUT /movies/:id`, `DELETE /movies/:id` | CRUD películas. |
| `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | CRUD categorías. |
| `POST /screens`, `PUT /screens/:id`, `DELETE /screens/:id` | CRUD salas. |
| `POST /screens/:id/seats` | Generar butacas para una sala. |
| `POST /showtimes`, `PUT /showtimes/:id`, `DELETE /showtimes/:id` | CRUD funciones. |
| `GET /admin/reservations` | Todas las reservas (paginadas). |
| `GET /admin/reports/revenue` | Reporte de ingresos. |
| `GET /admin/reports/occupancy` | Reporte de ocupación. |
| `GET /admin/reports/movies/:id` | Detalle financiero por película. |

## 5. Plan de implementación detallado

### 5.1 Setup inicial (Día 1)
- Crear proyecto con Vite:
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
```
- Instalar dependencias:
```bash
npm install react-router-dom @tanstack/react-query axios react-hook-form zod @hookform/resolvers
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install tailwindcss @tailwindcss/vite date-fns sonner
npm install -D @types/node
```
- Configurar `vite.config.ts` con plugin de Tailwind.
- Configurar `tsconfig.json` con paths (`@/*`).
- Crear `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:3000
```
- Crear `src/config/env.ts`:
```ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
};
```

### 5.2 Configurar Axios + Interceptores (Día 1-2)
- Crear `src/lib/api.ts`: instancia axios con baseURL.
- Request interceptor: añadir `Authorization: Bearer <accessToken>` si existe en localStorage.
- Response interceptor: si 401 y hay refresh token -> llamar `/auth/refresh`, guardar nuevo token, reintentar request original. Si refresh falla -> logout y redirigir a login.

### 5.3 Auth (Día 2-3)
- Crear `features/auth/types.ts`, `auth.api.ts`.
- Crear `AuthContext` + `AuthProvider` con lógica de login/register/refresh/logout.
- Hooks: `useAuth()`.
- Páginas: `LoginPage`, `RegisterPage`.
- Route guards: `ProtectedRoute`, `GuestRoute`, `AdminRoute`.

### 5.4 Layout y navegación (Día 3)
- Crear `components/layout/AppNavbar.tsx`: logo, cartelera, mis reservas, login/registro/usuario/admin/logout.
- `AppLayout.tsx`: Navbar + `<Outlet />` + Footer.
- Theme MUI: crear tema personalizado (colores cine: rojo/negro/dorado) compatible con Tailwind.
- Configurar providers en `app/providers.tsx` (QueryClientProvider, ThemeProvider, AuthProvider, Toaster).

### 5.5 Cartelera y detalle película (Día 4-5)
- Páginas: `HomePage` (cartelera), `MovieDetailPage`.
- Componentes: `MovieCard`, `MovieGrid`.
- Hooks: `useMovies()`, `useMovie(id)`, `useShowtimes(filters)`.
- Mostrar funciones por fecha: seleccionar fecha (tabs/chips) -> filtrar `showtimes` por película/fecha.

### 5.6 Selección de butacas (Día 6-7) - **Clave**
- Página: `SeatSelectionPage` (`/showtimes/:id/seats`).
- Obtener `GET /showtimes/:id/seats` (estado: disponibles/ocupadas).
- Componente `SeatMap`: cuadrícula/sala, leyenda (Libre/Seleccionado/Ocupado).
- Estado: `selectedSeatIds[] = []`.
- Mostrar resumen (asientos seleccionados + precio total).
- Botón "Confirmar reserva" requiere autenticación (redirigir a login con `returnUrl`).
- Llamar `POST /reservations` con `{ showtimeId, seatIds }`.
- Mostrar resultado: éxito con resumen + link a "Mis reservas".

### 5.7 Mis reservas (Día 7-8)
- Página: `MyReservationsPage`.
- `GET /reservations`.
- Tarjetas: película, sala, fecha/hora, butacas, precio, estado.
- Botón "Cancelar" (confirmación MUI Dialog) si el estado lo permite.
- Invalidar query tras cancelar para refrescar lista.

### 5.8 Panel Admin (Día 9-14) - Complejo
Crear subrutas `/admin/*` con Sidebar.

| Página | Funcionalidad | Endpoint(s) |
|---|---|---|
| **Dashboard** | Resumen (conteo películas, salas, reservas, ingresos) | `GET /admin/reports/revenue`, `GET /admin/reports/occupancy` |
| **Películas** | Tabla CRUD: añadir/editar/eliminar películas, asociar categorías | `GET/POST/PUT/DELETE /movies`, `GET /categories` |
| **Categorías** | Tabla CRUD | `GET/POST/PUT/DELETE /categories` |
| **Salas** | Tabla CRUD: crear sala, "Gestionar butacas" (`POST /screens/:id/seats`) | `GET/POST/PUT/DELETE /screens` |
| **Funciones** | Tabla CRUD: crear/editar/eliminar showtime (película, sala, fecha/hora, precio) | `GET/POST/PUT/DELETE /showtimes`, `GET /movies`, `GET /screens` |
| **Reservas** | Lista todas las reservas (paginadas) con filtros/detalles | `GET /admin/reservations` |
| **Reportes** | Gráficos (Recharts/Chart.js) - ingresos por fecha, ocupación, detalle por película | Reports endpoints |

**Componentes admin:** `AdminLayout` (Sidebar + Header), `DataTable` (MUI Table con paginación), `ConfirmDialog`, `FormDialog`.

## 6. Diseño UI/UX sugerido

| Elemento | Sugerencia |
|---|---|
| **Colores** | Tema oscuro/clásico cine: `#0f0f0f` fondo, `#d32f2f` primario (rojo), `#ffffff` texto, acentos dorados. Combinar con paleta MUI. |
| **Tipografía** | `Inter`, `Roboto` (MUI default), o `Poppins`. |
| **Cartelera** | Grid de posters 2/3/4 columnas responsive. Tarjeta con título, categoría, "Ver funciones". |
| **Selector butacas** | Pantalla arriba, leyenda abajo, butacas circulares/cuadradas estilo cine. Colores: verde/libre, amarillo/seleccionado, rojo/ocupado, gris/disabled. |
| **Admin** | Sidebar fijo, tablas compactas, formularios en `FormDialog` con React Hook Form + Zod, snackbars para éxito/error. |
| **Responsive** | Mobile first. Selector de butacas debe funcionar bien en móvil (desplazamiento horizontal si necesario). |

## 7. Plan de implementación por fases

| Fase | Tareas | Duración estimada | Estado |
|---|---|---|---|
| **Fase 0: Setup** | Crear proyecto Vite+React+TS, instalar deps, configurar Tailwind+MUI, estructura carpetas, .env, axios base. | 1-2 días | Pendiente |
| **Fase 1: Auth & Layout** | AuthContext, interceptores, login/register, route guards, Navbar/Footer/Layout, tema MUI. | 2-3 días | Pendiente |
| **Fase 2: Cartelera** | Home (movies), MovieDetail (showtimes por fecha), hooks TanStack Query. | 2-3 días | Pendiente |
| **Fase 3: Reservas (cliente)** | SeatSelection, crear reserva, MyReservations, cancelación. | 3-4 días | Pendiente |
| **Fase 4: Admin Panel** | Layout admin, CRUD Movies/Categories/Screens/Showtimes, gestionar butacas, listar reservas admin. | 4-5 días | Pendiente |
| **Fase 5: Reportes & Pulido** | Reportes con gráficos, paginación, filtros, estados vacíos, loading skeletons, responsive, notificaciones. | 2-3 días | Pendiente |
| **Fase 6: Testing & Deploy** | Pruebas manuales de flujos críticos (login, reservar, cancelar, admin CRUD), ajustar errores, build, despliegue (Vercel/Netlify + backend). | 2-3 días | Pendiente |
| **Total** | | **16-23 días** | | 

## 8. Configuración y archivos clave

### 8.1 CORS en backend
Verifica `CORS_ORIGIN` en `.env` del backend. Si vas a correr frontend en `http://localhost:5173` (Vite default), añade esa URL. Actualmente usa `env.CORS_ORIGIN`. Ajusta el `.env` del backend si es necesario.

### 8.2 Variables entorno frontend
`.env.development`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 8.3 Scripts recomendados
Añadir al `package.json` raíz del backend (opcional):
```json
"scripts": {
  "dev:all": "concurrently \"bun dev\" \"cd frontend && npm run dev\""
}
```

O simplemente correr dos terminales. Con Bun puedes usar `bunx concurrently`.

## 9. Recomendaciones importantes

| Recomendación | Explicación |
|---|---|
| **Usar TanStack Query** | Mejor que `useEffect` + `useState`. Maneja caché, refetch, loading, error. Genera menos código. |
| **Interceptores Axios** | Implementar refresh automático es crucial. Sin esto, cada vez que expire `accessToken` tendrás que re-login. |
| **No guardar contraseñas** | Usa JWT tal como está. El backend devuelve tokens en body; con SPA es común usar `localStorage`. |
| **Validación en frontend** | Usa Zod + React Hook Form igual que backend. Mejora UX, evita llamadas innecesarias. |
| **Butacas: UI clara** | El selector de butacas es el componente más importante. Usa leyenda, mostrar resumen (asientos + precio * cantidad), bloquear si no autenticado. |
| **Permisos por ruta** | Siempre proteger `/admin/*` con `AdminRoute`, validar role desde `AuthContext` (no confiar solo en UI, backend ya protege con RBAC). |
| **Tipos compartidos** | Si usas monorepo, crea `shared/types` con tipos derivados de `src/db/schema.ts`. Si repo separado, copia tipos necesarios o usa `openapi-typescript` con `/api-docs.json`. |
| **Paginación** | Backend ya tiene paginación. Usa parámetros `page`, `limit` en frontend (MUI Pagination). |
| **Errores** | Usa `AppError` del backend (tiene `statusCode`, `message`). Muestra mensajes legibles via `sonner`. |
| **Build optimizado** | Vite genera chunks. Usa lazy loading para rutas (`React.lazy`) especialmente en admin panel. |

## 10. Checklist inicial (pasos inmediatos)

- [ ] **Verificar CORS**: Añadir `http://localhost:5173` a `CORS_ORIGIN` en el `.env` del backend.
- [ ] **Crear carpeta frontend**: `mkdir frontend && cd frontend && npm create vite@latest . -- --template react-ts`
- [ ] **Instalar dependencias**: Ver sección 5.1.
- [ ] **Crear estructura**: Carpeta `src/app`, `src/components`, `src/features`, etc.
- [ ] **Configuración inicial**: `vite.config.ts`, Tailwind v4 con plugin, theme MUI, env.
- [ ] **Axios + auth context**: Setup básico de autenticación.
- [ ] **Empezar**: Cartelera pública & login - primeros hitos, validar conexión con backend.
