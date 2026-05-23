import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────
export const authSchema = z.object({
  email: z.email().describe("Email del usuario"),
  password: z.string().min(1).describe("Contraseña"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Movies ────────────────────────────────────────────────
export const createMovieSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  posterUrl: z.string().max(500).optional(),
  durationMinutes: z.number().int().positive(),
  categoryIds: z.array(z.number().int().positive()).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

export const movieQuerySchema = z.object({
  title: z.string().optional(),
  category: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Categories ────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Screens ───────────────────────────────────────────────
export const createScreenSchema = z.object({
  name: z.string().min(1).max(100),
  totalCapacity: z.number().int().min(0),
});

export const updateScreenSchema = createScreenSchema.partial();

export const generateSeatsSchema = z.object({
  rows: z.number().int().positive(),
  seatsPerRow: z.number().int().positive(),
});

// ─── Showtimes ─────────────────────────────────────────────
export const createShowtimeSchema = z.object({
  movieId: z.number().int().positive(),
  screenId: z.number().int().positive(),
  startTime: z.iso.datetime(),
  ticketPrice: z.number().positive(),
});

export const updateShowtimeSchema = createShowtimeSchema.partial();

export const showtimeQuerySchema = z.object({
  movie_id: z.coerce.number().int().positive().optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Reservations ──────────────────────────────────────────
export const createReservationSchema = z.object({
  showtimeId: z.number().int().positive(),
  seatIds: z.array(z.number().int().positive()).min(1),
});

// ─── Reports ───────────────────────────────────────────────
export const revenueQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const occupancyQuerySchema = z.object({
  movie_id: z.coerce.number().int().positive().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// ─── Shared: param id ──────────────────────────────────────
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
