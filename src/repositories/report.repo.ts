import { db } from "../db";
import { movies, showtimes, screens, reservations, reservedSeats } from "../db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export const reportRepo = {
  async revenue(from?: string, to?: string) {
    const conditions = [eq(reservations.status, "ACTIVE")];

    if (from) {
      conditions.push(gte(reservations.createdAt, new Date(from)));
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      conditions.push(lte(reservations.createdAt, toDate));
    }

    const [total] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${reservations.totalAmount})::numeric, 0)`.as("totalRevenue"),
        totalReservations: sql<number>`COUNT(${reservations.id})::int`.as("totalReservations"),
      })
      .from(reservations)
      .where(and(...conditions));

    const seatCountSubquery = db.$with("seat_counts").as(
      db
        .select({
          reservationId: reservedSeats.reservationId,
          seatCount: sql<number>`COUNT(${reservedSeats.id})::int`.as("seatCount"),
        })
        .from(reservedSeats)
        .groupBy(reservedSeats.reservationId)
    );

    const byMovie = await db
      .with(seatCountSubquery)
      .select({
        movieId: movies.id,
        movieTitle: movies.title,
        revenue: sql<string>`COALESCE(SUM(${reservations.totalAmount})::numeric, 0)`.as("revenue"),
        ticketsSold: sql<number>`COALESCE(SUM(${seatCountSubquery.seatCount}), 0)::int`.as("ticketsSold"),
        reservationsCount: sql<number>`COUNT(${reservations.id})::int`.as("reservationsCount"),
      })
      .from(reservations)
      .innerJoin(showtimes, eq(showtimes.id, reservations.showtimeId))
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .leftJoin(seatCountSubquery, eq(seatCountSubquery.reservationId, reservations.id))
      .where(and(...conditions))
      .groupBy(movies.id, movies.title)
      .orderBy(sql`SUM(${reservations.totalAmount}) DESC NULLS LAST`);

    const totalTickets = byMovie.reduce((sum, m) => sum + Number(m.ticketsSold), 0);

    return { total: { ...total, totalTickets }, byMovie };
  },

  async occupancy(filters?: { movie_id?: number; from?: string; to?: string }) {
    const showtimeConditions: ReturnType<typeof eq    >[] = [];

    if (filters?.movie_id) {
      showtimeConditions.push(eq(showtimes.movieId, filters.movie_id));
    }
    if (filters?.from) {
      showtimeConditions.push(gte(showtimes.startTime, new Date(filters.from)));
    }
    if (filters?.to) {
      const toDate = new Date(filters.to);
      toDate.setDate(toDate.getDate() + 1);
      showtimeConditions.push(lte(showtimes.startTime, toDate));
    }

    const occStats = db.$with("occ_stats").as(
      db
        .select({
          showtimeId: reservedSeats.showtimeId,
          occupied: sql<number>`COUNT(${reservedSeats.id})::int`.as("occupied"),
        })
        .from(reservedSeats)
        .innerJoin(reservations, and(eq(reservations.id, reservedSeats.reservationId), eq(reservations.status, "ACTIVE")))
        .groupBy(reservedSeats.showtimeId)
    );

    const revStats = db.$with("rev_stats").as(
      db
        .select({
          showtimeId: reservations.showtimeId,
          revenue: sql<string>`COALESCE(SUM(${reservations.totalAmount})::numeric, 0)`.as("revenue"),
        })
        .from(reservations)
        .where(eq(reservations.status, "ACTIVE"))
        .groupBy(reservations.showtimeId)
    );

    const report = await db
      .with(occStats, revStats)
      .select({
        showtimeId: showtimes.id,
        startTime: showtimes.startTime,
        ticketPrice: showtimes.ticketPrice,
        movieId: movies.id,
        movieTitle: movies.title,
        screenId: screens.id,
        screenName: screens.name,
        capacity: screens.totalCapacity,
        occupied: sql<number>`COALESCE(${occStats.occupied}, 0)::int`.as("occupied"),
        revenue: sql<string>`COALESCE(${revStats.revenue}, '0')`.as("revenue"),
      })
      .from(showtimes)
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .innerJoin(screens, eq(screens.id, showtimes.screenId))
      .leftJoin(occStats, eq(occStats.showtimeId, showtimes.id))
      .leftJoin(revStats, eq(revStats.showtimeId, showtimes.id))
      .where(showtimeConditions.length > 0 ? and(...showtimeConditions) : undefined)
      .orderBy(showtimes.startTime);

    return report.map((r) => ({
      ...r,
      occupancyPct: r.capacity > 0 ? Number(((r.occupied / r.capacity) * 100).toFixed(1)) : 0,
    }));
  },

  async movieDetail(movieId: number) {
    const [movie] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1);
    if (!movie) return null;

    const seatStats = db.$with("seat_stats").as(
      db
        .select({
          showtimeId: reservedSeats.showtimeId,
          reservationId: reservedSeats.reservationId,
          occupied: sql<number>`COUNT(${reservedSeats.id})::int`.as("occupied"),
        })
        .from(reservedSeats)
        .innerJoin(reservations, and(eq(reservations.id, reservedSeats.reservationId), eq(reservations.status, "ACTIVE")))
        .groupBy(reservedSeats.showtimeId, reservedSeats.reservationId)
    );

    const [summary] = await db
      .with(seatStats)
      .select({
        totalShowtimes: sql<number>`COUNT(DISTINCT ${showtimes.id})::int`.as("totalShowtimes"),
        totalReservations: sql<number>`COUNT(DISTINCT ${reservations.id})::int`.as("totalReservations"),
        totalTicketsSold: sql<number>`COALESCE(SUM(${seatStats.occupied}), 0)::int`.as("totalTicketsSold"),
        totalRevenue: sql<string>`COALESCE(SUM(${reservations.totalAmount})::numeric, 0)`.as("totalRevenue"),
      })
      .from(movies)
      .leftJoin(showtimes, eq(showtimes.movieId, movies.id))
      .leftJoin(reservations, and(eq(reservations.showtimeId, showtimes.id), eq(reservations.status, "ACTIVE")))
      .leftJoin(seatStats, and(eq(seatStats.showtimeId, reservations.showtimeId), eq(seatStats.reservationId, reservations.id)))
      .where(eq(movies.id, movieId));

    const showtimeOccStats = db.$with("showtime_occ_stats").as(
      db
        .select({
          showtimeId: reservedSeats.showtimeId,
          occupied: sql<number>`COUNT(${reservedSeats.id})::int`.as("occupied"),
          reservationsCount: sql<number>`COUNT(DISTINCT ${reservations.id})::int`.as("reservationsCount"),
        })
        .from(reservedSeats)
        .innerJoin(reservations, and(eq(reservations.id, reservedSeats.reservationId), eq(reservations.status, "ACTIVE")))
        .groupBy(reservedSeats.showtimeId)
    );

    const showtimeRevStats = db.$with("showtime_rev_stats").as(
      db
        .select({
          showtimeId: reservations.showtimeId,
          revenue: sql<string>`COALESCE(SUM(${reservations.totalAmount})::numeric, 0)`.as("revenue"),
        })
        .from(reservations)
        .where(eq(reservations.status, "ACTIVE"))
        .groupBy(reservations.showtimeId)
    );

    const showtimeDetail = await db
      .with(showtimeOccStats, showtimeRevStats)
      .select({
        showtimeId: showtimes.id,
        startTime: showtimes.startTime,
        ticketPrice: showtimes.ticketPrice,
        screenName: screens.name,
        capacity: screens.totalCapacity,
        occupied: sql<number>`COALESCE(${showtimeOccStats.occupied}, 0)::int`.as("occupied"),
        revenue: sql<string>`COALESCE(${showtimeRevStats.revenue}, '0')`.as("revenue"),
        reservationsCount: sql<number>`COALESCE(${showtimeOccStats.reservationsCount}, 0)::int`.as("reservationsCount"),
      })
      .from(showtimes)
      .innerJoin(screens, eq(screens.id, showtimes.screenId))
      .leftJoin(showtimeOccStats, eq(showtimeOccStats.showtimeId, showtimes.id))
      .leftJoin(showtimeRevStats, eq(showtimeRevStats.showtimeId, showtimes.id))
      .where(eq(showtimes.movieId, movieId))
      .orderBy(showtimes.startTime);

    const avgOccupancyPct = showtimeDetail.length > 0
      ? Number(
          (showtimeDetail.reduce((acc, s) => {
            const pct = s.capacity > 0 ? (s.occupied / s.capacity) * 100 : 0;
            return acc + pct;
          }, 0) / showtimeDetail.length).toFixed(1)
        )
      : 0;

    return {
      movie,
      summary: { ...summary, avgOccupancyPct },
      showtimes: showtimeDetail.map((s) => ({
        ...s,
        occupancyPct: s.capacity > 0 ? Number(((s.occupied / s.capacity) * 100).toFixed(1)) : 0,
      })),
    };
  },
};
