import { db } from "../db";
import {
  reservations,
  reservedSeats,
  showtimes,
  movies,
  screens,
  seats,
} from "../db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export interface CreateReservationData {
  userId: number;
  showtimeId: number;
  seatIds: number[];
  totalAmount: string;
}

export const reservationRepo = {
  async create(data: CreateReservationData) {
    const { userId, showtimeId, seatIds, totalAmount } = data;

    const [reservation] = await db
      .insert(reservations)
      .values({
        userId,
        showtimeId,
        status: "ACTIVE",
        totalAmount,
      })
      .returning();

    const ticketPrice = (Number(totalAmount) / seatIds.length).toFixed(2);
    const seatsData = seatIds.map((seatId) => ({
      reservationId: reservation!.id,
      showtimeId,
      seatId,
      pricePaid: ticketPrice,
    }));

    await db.insert(reservedSeats).values(seatsData);

    const createdSeats = await db
      .select({
        id: seats.id,
        rowLetter: seats.rowLetter,
        seatNumber: seats.seatNumber,
        pricePaid: reservedSeats.pricePaid,
      })
      .from(reservedSeats)
      .innerJoin(seats, eq(seats.id, reservedSeats.seatId))
      .where(eq(reservedSeats.reservationId, reservation!.id));

    return { reservation, seats: createdSeats };
  },

  findConflicts(showtimeId: number, seatIds: number[]) {
    return db
      .select({ seatId: reservedSeats.seatId })
      .from(reservedSeats)
      .innerJoin(reservations, eq(reservations.id, reservedSeats.reservationId))
      .where(
        and(
          eq(reservedSeats.showtimeId, showtimeId),
          eq(reservations.status, "ACTIVE"),
          inArray(reservedSeats.seatId, seatIds)
        )
      );
  },

  findByUser(userId: number) {
    return db
      .select({
        id: reservations.id,
        status: reservations.status,
        totalAmount: reservations.totalAmount,
        createdAt: reservations.createdAt,
        showtime: sql<{ id: number; startTime: string; ticketPrice: string }>`
          json_build_object('id', ${showtimes.id}, 'startTime', ${showtimes.startTime}, 'ticketPrice', ${showtimes.ticketPrice})
        `,
        movie: sql<{ id: number; title: string; durationMinutes: number }>`
          json_build_object('id', ${movies.id}, 'title', ${movies.title}, 'durationMinutes', ${movies.durationMinutes})
        `,
        screen: sql<{ id: number; name: string }>`
          json_build_object('id', ${screens.id}, 'name', ${screens.name})
        `,
        seats: sql<{ id: number; rowLetter: string; seatNumber: number; pricePaid: string }[]>`
          COALESCE(
            json_agg(
              json_build_object('id', ${seats.id}, 'rowLetter', ${seats.rowLetter}, 'seatNumber', ${seats.seatNumber}, 'pricePaid', ${reservedSeats.pricePaid})
              ORDER BY ${seats.rowLetter}, ${seats.seatNumber}
            ) FILTER (WHERE ${seats.id} IS NOT NULL),
            '[]'
          )
        `,
      })
      .from(reservations)
      .innerJoin(showtimes, eq(showtimes.id, reservations.showtimeId))
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .innerJoin(screens, eq(screens.id, showtimes.screenId))
      .leftJoin(reservedSeats, eq(reservedSeats.reservationId, reservations.id))
      .leftJoin(seats, eq(seats.id, reservedSeats.seatId))
      .where(eq(reservations.userId, userId))
      .groupBy(reservations.id, showtimes.id, movies.id, screens.id)
      .orderBy(sql`${reservations.createdAt} DESC`);
  },

  findById(id: number) {
    return db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
  },

  cancel(id: number) {
    return db
      .update(reservations)
      .set({ status: "CANCELLED" })
      .where(eq(reservations.id, id))
      .returning();
  },
};
