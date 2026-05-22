import { db } from "../db";
import { showtimes, movies, screens, seats, reservedSeats, reservations } from "../db/schema";
import { eq, and, gte, lte, sql, type SQL } from "drizzle-orm";
import { paginated } from "../lib/pagination";

export interface CreateShowtimeData {
  movieId: number;
  screenId: number;
  startTime: Date;
  ticketPrice: string;
}

export const showtimeRepo = {
  create(data: CreateShowtimeData) {
    return db.insert(showtimes).values(data).returning();
  },

  update(id: number, data: Partial<CreateShowtimeData>) {
    return db
      .update(showtimes)
      .set(data)
      .where(eq(showtimes.id, id))
      .returning();
  },

  delete(id: number) {
    return db.delete(showtimes).where(eq(showtimes.id, id));
  },

  findById(id: number) {
    return db.select().from(showtimes).where(eq(showtimes.id, id)).limit(1);
  },

  async findAll(
    filters?: { movie_id?: number; date?: string },
    page = 1,
    limit = 20,
  ) {
    const conditions: SQL[] = [];

    if (filters?.movie_id) {
      conditions.push(eq(showtimes.movieId, filters.movie_id));
    }

    if (filters?.date) {
      const from = new Date(filters.date);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      conditions.push(gte(showtimes.startTime, from));
      conditions.push(lte(showtimes.startTime, to));
    }

    const query = db
      .select({
        id: showtimes.id,
        startTime: showtimes.startTime,
        ticketPrice: showtimes.ticketPrice,
        movieId: showtimes.movieId,
        screenId: showtimes.screenId,
        movie: sql<{ id: number; title: string; durationMinutes: number }>`
          json_build_object('id', ${movies.id}, 'title', ${movies.title}, 'durationMinutes', ${movies.durationMinutes})
        `,
        screen: sql<{ id: number; name: string; totalCapacity: number }>`
          json_build_object('id', ${screens.id}, 'name', ${screens.name}, 'totalCapacity', ${screens.totalCapacity})
        `,
      })
      .from(showtimes)
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .innerJoin(screens, eq(screens.id, showtimes.screenId))
      .$dynamic();

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const data = await query
      .orderBy(showtimes.startTime)
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(showtimes)
      .$dynamic();

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const [totalRow] = await countQuery;

    return paginated(data, Number(totalRow?.count ?? 0), page, limit);
  },

  findWithDetails(id: number) {
    return db
      .select({
        id: showtimes.id,
        startTime: showtimes.startTime,
        ticketPrice: showtimes.ticketPrice,
        movieId: showtimes.movieId,
        screenId: showtimes.screenId,
        movie: sql<{ id: number; title: string; durationMinutes: number }>`
          json_build_object('id', ${movies.id}, 'title', ${movies.title}, 'durationMinutes', ${movies.durationMinutes})
        `,
        screen: sql<{ id: number; name: string; totalCapacity: number }>`
          json_build_object('id', ${screens.id}, 'name', ${screens.name}, 'totalCapacity', ${screens.totalCapacity})
        `,
      })
      .from(showtimes)
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .innerJoin(screens, eq(screens.id, showtimes.screenId))
      .where(eq(showtimes.id, id))
      .limit(1);
  },

  async getSeatAvailability(showtimeId: number) {
    const [showtime] = await db
      .select({ id: showtimes.id, screenId: showtimes.screenId })
      .from(showtimes)
      .where(eq(showtimes.id, showtimeId))
      .limit(1);

    if (!showtime) return null;

    const result = await db
      .select({
        id: seats.id,
        rowLetter: seats.rowLetter,
        seatNumber: seats.seatNumber,
        status: sql<string>`
          CASE
            WHEN ${reservedSeats.id} IS NOT NULL AND ${reservations.status} = 'ACTIVE' THEN 'reserved'
            ELSE 'available'
          END
        `,
      })
      .from(seats)
      .leftJoin(
        reservedSeats,
        and(
          eq(reservedSeats.seatId, seats.id),
          eq(reservedSeats.showtimeId, showtimeId)
        )
      )
      .leftJoin(reservations, eq(reservations.id, reservedSeats.reservationId))
      .where(eq(seats.screenId, showtime.screenId))
      .orderBy(seats.rowLetter, seats.seatNumber);

    return result;
  },
};
