import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 10 }).notNull().default("USER"),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  posterUrl: varchar("poster_url", { length: 500 }),
  durationMinutes: integer("duration_minutes").notNull(),
}, (table) => [
  index("idx_movies_title").on(table.title),
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const movieCategories = pgTable(
  "movie_categories",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.movieId, table.categoryId] }),
  ]
);

export const screens = pgTable("screens", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  totalCapacity: integer("total_capacity").notNull(),
});

export const seats = pgTable(
  "seats",
  {
    id: serial("id").primaryKey(),
    screenId: integer("screen_id")
      .notNull()
      .references(() => screens.id, { onDelete: "cascade" }),
    rowLetter: varchar("row_letter", { length: 1 }).notNull(),
    seatNumber: integer("seat_number").notNull(),
  },
  (table) => [
    uniqueIndex("unique_seat").on(table.screenId, table.rowLetter, table.seatNumber),
  ]
);

export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  screenId: integer("screen_id")
    .notNull()
    .references(() => screens.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index("idx_showtimes_movie_id").on(table.movieId),
  index("idx_showtimes_screen_id").on(table.screenId),
  index("idx_showtimes_start_time").on(table.startTime),
]);

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  showtimeId: integer("showtime_id")
    .notNull()
    .references(() => showtimes.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 10 }).notNull().default("ACTIVE"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("idx_reservations_user_id").on(table.userId),
  index("idx_reservations_showtime_id").on(table.showtimeId),
]);

export const reservedSeats = pgTable(
  "reserved_seats",
  {
    id: serial("id").primaryKey(),
    reservationId: integer("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    showtimeId: integer("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    seatId: integer("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    pricePaid: decimal("price_paid", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    uniqueIndex("unique_reserved_seat").on(table.showtimeId, table.seatId),
  ]
);
