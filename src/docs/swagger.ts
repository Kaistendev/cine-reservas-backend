import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cine Reservas API",
      version: "1.0.0",
      description: "API de reserva de boletos de cine. Incluye autenticación JWT, roles (ADMIN/USER), CRUD de películas, salas, funciones, reservas con control de concurrencia y reportes financieros.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local dev" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", description: "Mensaje de error" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string", description: "JWT access token (15 min)" },
            refreshToken: { type: "string", description: "JWT refresh token (7 días)" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["ADMIN", "USER"] },
              },
            },
          },
        },
        AuthInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", description: "Email del usuario" },
            password: { type: "string", description: "Contraseña" },
          },
        },
        RefreshTokenInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", description: "Refresh token obtenido en login/register" },
          },
        },
        RefreshTokenResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string", description: "Nuevo access token (15 min)" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "USER"] },
          },
        },
        Movie: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            posterUrl: { type: "string", nullable: true },
            durationMinutes: { type: "integer" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        CreateMovieInput: {
          type: "object",
          required: ["title", "durationMinutes"],
          properties: {
            title: { type: "string", maxLength: 255 },
            description: { type: "string" },
            posterUrl: { type: "string", maxLength: 500 },
            durationMinutes: { type: "integer", minimum: 1 },
            categoryIds: {
              type: "array",
              items: { type: "integer" },
              description: "IDs de categorías para asociar",
            },
          },
        },
        UpdateMovieInput: {
          type: "object",
          properties: {
            title: { type: "string", maxLength: 255 },
            description: { type: "string" },
            posterUrl: { type: "string", maxLength: 500 },
            durationMinutes: { type: "integer", minimum: 1 },
            categoryIds: {
              type: "array",
              items: { type: "integer" },
            },
          },
        },
        PaginatedMovies: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Movie" },
            },
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
          },
        },
        CreateCategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", maxLength: 100 },
          },
        },
        UpdateCategoryInput: {
          type: "object",
          properties: {
            name: { type: "string", maxLength: 100 },
          },
        },
        PaginatedCategories: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        Screen: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            totalCapacity: { type: "integer" },
          },
        },
        ScreenWithSeats: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            totalCapacity: { type: "integer" },
            seats: {
              type: "array",
              items: { $ref: "#/components/schemas/Seat" },
            },
          },
        },
        CreateScreenInput: {
          type: "object",
          required: ["name", "totalCapacity"],
          properties: {
            name: { type: "string", maxLength: 100 },
            totalCapacity: { type: "integer", minimum: 0 },
          },
        },
        UpdateScreenInput: {
          type: "object",
          properties: {
            name: { type: "string", maxLength: 100 },
            totalCapacity: { type: "integer", minimum: 0 },
          },
        },
        GenerateSeatsInput: {
          type: "object",
          required: ["rows", "seatsPerRow"],
          properties: {
            rows: { type: "integer", minimum: 1 },
            seatsPerRow: { type: "integer", minimum: 1 },
          },
        },
        GenerateSeatsResponse: {
          type: "object",
          properties: {
            screenId: { type: "integer" },
            totalCapacity: { type: "integer" },
            seatsCreated: { type: "integer" },
            seats: {
              type: "array",
              items: { $ref: "#/components/schemas/Seat" },
            },
          },
        },
        Seat: {
          type: "object",
          properties: {
            id: { type: "integer" },
            screenId: { type: "integer" },
            rowLetter: { type: "string" },
            seatNumber: { type: "integer" },
          },
        },
        Showtime: {
          type: "object",
          properties: {
            id: { type: "integer" },
            movieId: { type: "integer" },
            screenId: { type: "integer" },
            startTime: { type: "string", format: "date-time" },
            ticketPrice: { type: "string", description: "Precio del boleto" },
            movie: {
              type: "object",
              properties: {
                id: { type: "integer" },
                title: { type: "string" },
                durationMinutes: { type: "integer" },
              },
            },
            screen: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                totalCapacity: { type: "integer" },
              },
            },
          },
        },
        CreateShowtimeInput: {
          type: "object",
          required: ["movieId", "screenId", "startTime", "ticketPrice"],
          properties: {
            movieId: { type: "integer", description: "ID de la película" },
            screenId: { type: "integer", description: "ID de la sala" },
            startTime: { type: "string", format: "date-time", description: "Fecha y hora de la función" },
            ticketPrice: { type: "number", description: "Precio del boleto" },
          },
        },
        UpdateShowtimeInput: {
          type: "object",
          properties: {
            movieId: { type: "integer" },
            screenId: { type: "integer" },
            startTime: { type: "string", format: "date-time" },
            ticketPrice: { type: "number" },
          },
        },
        PaginatedShowtimes: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Showtime" },
            },
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        SeatAvailability: {
          type: "object",
          properties: {
            id: { type: "integer" },
            screenId: { type: "integer" },
            rowLetter: { type: "string" },
            seatNumber: { type: "integer" },
            status: { type: "string", enum: ["available", "reserved"] },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            showtimeId: { type: "integer" },
            status: { type: "string", enum: ["ACTIVE", "CANCELLED"] },
            totalAmount: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            seats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  rowLetter: { type: "string" },
                  seatNumber: { type: "integer" },
                  pricePaid: { type: "string" },
                },
              },
            },
            showtime: {
              type: "object",
              properties: {
                id: { type: "integer" },
                startTime: { type: "string", format: "date-time" },
                movie: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    title: { type: "string" },
                  },
                },
                screen: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
        },
        CreateReservationInput: {
          type: "object",
          required: ["showtimeId", "seatIds"],
          properties: {
            showtimeId: { type: "integer", description: "ID de la función" },
            seatIds: {
              type: "array",
              items: { type: "integer" },
              description: "IDs de los asientos a reservar",
            },
          },
        },
        CreateReservationResponse: {
          type: "object",
          properties: {
            reservation: { $ref: "#/components/schemas/Reservation" },
            seats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  rowLetter: { type: "string" },
                  seatNumber: { type: "integer" },
                  pricePaid: { type: "string" },
                },
              },
            },
          },
        },
        RevenueReport: {
          type: "object",
          properties: {
            totalRevenue: { type: "string" },
            totalReservations: { type: "integer" },
            totalTicketsSold: { type: "integer" },
            from: { type: "string", nullable: true },
            to: { type: "string", nullable: true },
          },
        },
        OccupancyReport: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  showtimeId: { type: "integer" },
                  movieTitle: { type: "string" },
                  screenName: { type: "string" },
                  startTime: { type: "string", format: "date-time" },
                  totalSeats: { type: "integer" },
                  reservedSeats: { type: "integer" },
                  occupancyRate: { type: "string" },
                },
              },
            },
            from: { type: "string", nullable: true },
            to: { type: "string", nullable: true },
            movieId: { type: "integer", nullable: true },
          },
        },
        MovieDetailReport: {
          type: "object",
          properties: {
            movieId: { type: "integer" },
            title: { type: "string" },
            totalShowtimes: { type: "integer" },
            totalReservations: { type: "integer" },
            totalTicketsSold: { type: "integer" },
            totalRevenue: { type: "string" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      // ─── Auth ──────────────────────────────────────────────
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registrar nuevo usuario",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } },
          },
          responses: {
            201: { description: "Usuario registrado exitosamente", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Email ya registrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Iniciar sesión",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } },
          },
          responses: {
            200: { description: "Inicio de sesión exitoso", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Renovar access token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenInput" } } },
          },
          responses: {
            200: { description: "Nuevo access token", content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenResponse" } } } },
            401: { description: "Refresh token inválido o expirado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/me": {
        get: {
          tags: ["Auth"],
          summary: "Obtener usuario actual",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Usuario autenticado", content: { "application/json": { schema: { properties: { user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ─── Health ────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: { description: "Servidor funcionando", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } },
          },
        },
      },

      // ─── Movies ────────────────────────────────────────────
      "/movies": {
        get: {
          tags: ["Movies"],
          summary: "Listar películas (público)",
          parameters: [
            { in: "query", name: "title", schema: { type: "string" }, description: "Filtrar por título" },
            { in: "query", name: "category", schema: { type: "integer" }, description: "Filtrar por ID de categoría" },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: "Lista paginada de películas", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedMovies" } } } },
          },
        },
        post: {
          tags: ["Movies"],
          summary: "Crear película (ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMovieInput" } } },
          },
          responses: {
            201: { description: "Película creada", content: { "application/json": { schema: { $ref: "#/components/schemas/Movie" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado (se requiere ADMIN)" },
          },
        },
      },
      "/movies/{id}": {
        get: {
          tags: ["Movies"],
          summary: "Obtener detalle de película",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Detalle de la película", content: { "application/json": { schema: { $ref: "#/components/schemas/Movie" } } } },
            404: { description: "Película no encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["Movies"],
          summary: "Actualizar película (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMovieInput" } } },
          },
          responses: {
            200: { description: "Película actualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Movie" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Película no encontrada" },
          },
        },
        delete: {
          tags: ["Movies"],
          summary: "Eliminar película (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            204: { description: "Película eliminada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Película no encontrada" },
          },
        },
      },

      // ─── Categories ────────────────────────────────────────
      "/categories": {
        get: {
          tags: ["Categories"],
          summary: "Listar categorías (público)",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: "Lista paginada de categorías", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedCategories" } } } },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Crear categoría (ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryInput" } } },
          },
          responses: {
            201: { description: "Categoría creada", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Obtener categoría por ID",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Categoría", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
            404: { description: "Categoría no encontrada" },
          },
        },
        put: {
          tags: ["Categories"],
          summary: "Actualizar categoría (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryInput" } } },
          },
          responses: {
            200: { description: "Categoría actualizada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Categoría no encontrada" },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Eliminar categoría (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            204: { description: "Categoría eliminada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Categoría no encontrada" },
          },
        },
      },

      // ─── Screens ───────────────────────────────────────────
      "/screens": {
        get: {
          tags: ["Screens"],
          summary: "Listar salas (público)",
          responses: {
            200: { description: "Lista de salas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Screen" } } } } },
          },
        },
        post: {
          tags: ["Screens"],
          summary: "Crear sala (ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateScreenInput" } } },
          },
          responses: {
            201: { description: "Sala creada", content: { "application/json": { schema: { $ref: "#/components/schemas/Screen" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/screens/{id}": {
        get: {
          tags: ["Screens"],
          summary: "Obtener sala con asientos",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Sala con asientos", content: { "application/json": { schema: { $ref: "#/components/schemas/ScreenWithSeats" } } } },
            404: { description: "Sala no encontrada" },
          },
        },
        put: {
          tags: ["Screens"],
          summary: "Actualizar sala (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateScreenInput" } } },
          },
          responses: {
            200: { description: "Sala actualizada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Sala no encontrada" },
          },
        },
        delete: {
          tags: ["Screens"],
          summary: "Eliminar sala (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            204: { description: "Sala eliminada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Sala no encontrada" },
          },
        },
      },
      "/screens/{id}/seats": {
        post: {
          tags: ["Screens"],
          summary: "Generar asientos en una sala (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/GenerateSeatsInput" } } },
          },
          responses: {
            201: { description: "Asientos generados", content: { "application/json": { schema: { $ref: "#/components/schemas/GenerateSeatsResponse" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Sala no encontrada" },
          },
        },
      },

      // ─── Showtimes ─────────────────────────────────────────
      "/showtimes": {
        get: {
          tags: ["Showtimes"],
          summary: "Listar funciones (público)",
          parameters: [
            { in: "query", name: "movie_id", schema: { type: "integer" }, description: "Filtrar por película" },
            { in: "query", name: "date", schema: { type: "string" }, description: "Filtrar por fecha (YYYY-MM-DD)" },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: "Lista paginada de funciones", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedShowtimes" } } } },
          },
        },
        post: {
          tags: ["Showtimes"],
          summary: "Crear función (ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateShowtimeInput" } } },
          },
          responses: {
            201: { description: "Función creada", content: { "application/json": { schema: { $ref: "#/components/schemas/Showtime" } } } },
            400: { description: "Película o sala no encontrada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/showtimes/{id}": {
        get: {
          tags: ["Showtimes"],
          summary: "Obtener detalle de función",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Detalle de la función", content: { "application/json": { schema: { $ref: "#/components/schemas/Showtime" } } } },
            404: { description: "Función no encontrada" },
          },
        },
        put: {
          tags: ["Showtimes"],
          summary: "Actualizar función (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateShowtimeInput" } } },
          },
          responses: {
            200: { description: "Función actualizada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Función no encontrada" },
          },
        },
        delete: {
          tags: ["Showtimes"],
          summary: "Eliminar función (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            204: { description: "Función eliminada" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Función no encontrada" },
          },
        },
      },
      "/showtimes/{id}/seats": {
        get: {
          tags: ["Showtimes"],
          summary: "Ver disponibilidad de asientos (público)",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Asientos con estado de disponibilidad", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/SeatAvailability" } } } } },
            404: { description: "Función no encontrada" },
          },
        },
      },

      // ─── Reservations ──────────────────────────────────────
      "/reservations": {
        post: {
          tags: ["Reservations"],
          summary: "Crear reserva (USER)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateReservationInput" } } },
          },
          responses: {
            201: { description: "Reserva creada", content: { "application/json": { schema: { $ref: "#/components/schemas/CreateReservationResponse" } } } },
            400: { description: "Datos inválidos o función ya comenzó" },
            401: { description: "No autenticado" },
            404: { description: "Función no encontrada" },
            409: { description: "Asiento(s) ya reservado(s)" },
          },
        },
        get: {
          tags: ["Reservations"],
          summary: "Historial de reservas del usuario autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Reservas del usuario", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } } } } },
            401: { description: "No autenticado" },
          },
        },
      },
      "/reservations/{id}/cancel": {
        patch: {
          tags: ["Reservations"],
          summary: "Cancelar una reserva (solo dueño)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Reserva cancelada", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } },
            400: { description: "Reserva ya cancelada o función ya comenzó" },
            401: { description: "No autenticado" },
            403: { description: "No eres el dueño de esta reserva" },
            404: { description: "Reserva no encontrada" },
          },
        },
      },

      // ─── Admin ─────────────────────────────────────────────
      "/admin/reservations": {
        get: {
          tags: ["Admin"],
          summary: "Listar todas las reservas (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: "Lista paginada de reservas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      // ─── Admin Reports ─────────────────────────────────────
      "/admin/reports/revenue": {
        get: {
          tags: ["Reports"],
          summary: "Reporte de ingresos (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "from", schema: { type: "string", format: "date" }, description: "Fecha inicio (YYYY-MM-DD)" },
            { in: "query", name: "to", schema: { type: "string", format: "date" }, description: "Fecha fin (YYYY-MM-DD)" },
          ],
          responses: {
            200: { description: "Reporte de ingresos", content: { "application/json": { schema: { $ref: "#/components/schemas/RevenueReport" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/admin/reports/occupancy": {
        get: {
          tags: ["Reports"],
          summary: "Reporte de ocupación (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "movie_id", schema: { type: "integer" }, description: "Filtrar por película" },
            { in: "query", name: "from", schema: { type: "string", format: "date" }, description: "Fecha inicio" },
            { in: "query", name: "to", schema: { type: "string", format: "date" }, description: "Fecha fin" },
          ],
          responses: {
            200: { description: "Reporte de ocupación", content: { "application/json": { schema: { $ref: "#/components/schemas/OccupancyReport" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/admin/reports/movies/{id}": {
        get: {
          tags: ["Reports"],
          summary: "Detalle financiero de película (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Detalle financiero", content: { "application/json": { schema: { $ref: "#/components/schemas/MovieDetailReport" } } } },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "Película no encontrada" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
