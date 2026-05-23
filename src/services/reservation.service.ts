import { db } from "../db";
import {
  showtimes,
  seats,
  reservations,
  reservedSeats,
} from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { reservationRepo } from "../repositories/reservation.repo";
import { AppError } from "../lib/app-error";

export const reservationService = {
  async create(userId: number, showtimeId: number, seatIds: number[]) {
    return db.transaction(async (tx) => {
      const [showtime] = await tx
        .select()
        .from(showtimes)
        .where(eq(showtimes.id, showtimeId))
        .for("update");

      if (!showtime) throw new AppError(404, "Función no encontrada");
      if (new Date(showtime.startTime) < new Date()) {
        throw new AppError(400, "La función ya comenzó o pasó");
      }

      const validSeats = await tx
        .select({ id: seats.id })
        .from(seats)
        .where(
          and(
            eq(seats.screenId, showtime.screenId),
            inArray(seats.id, seatIds)
          )
        );

      if (validSeats.length !== seatIds.length) {
        throw new AppError(400, "Algunos asientos no pertenecen a esta sala");
      }

      const conflictSeats = await tx
        .select({ seatId: reservedSeats.seatId })
        .from(reservedSeats)
        .innerJoin(reservations, eq(reservations.id, reservedSeats.reservationId))
        .where(
          and(
            eq(reservedSeats.showtimeId, showtimeId),
            eq(reservations.status, "ACTIVE"),
            inArray(reservedSeats.seatId, seatIds)
          )
        )
        .for("update");

      if (conflictSeats.length > 0) {
        throw new AppError(409, "Uno o más asientos ya están reservados");
      }

      const ticketPrice = Number(showtime.ticketPrice);
      const totalAmount = (ticketPrice * seatIds.length).toFixed(2);

      const [reservation] = await tx
        .insert(reservations)
        .values({ userId, showtimeId, status: "ACTIVE", totalAmount })
        .returning();

      const seatsData = seatIds.map((seatId) => ({
        reservationId: reservation!.id,
        showtimeId,
        seatId,
        pricePaid: String(ticketPrice),
      }));

      await tx.insert(reservedSeats).values(seatsData);

      const createdSeats = await tx
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
    });
  },

  findByUser(userId: number) {
    return reservationRepo.findByUser(userId);
  },

  findAll(page = 1, limit = 20) {
    return reservationRepo.findAll(page, limit);
  },

  async cancel(userId: number, reservationId: number) {
    const [reservation] = await reservationRepo.findById(reservationId);
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    if (reservation.userId !== userId) {
      throw new AppError(403, "No puedes cancelar una reserva que no te pertenece");
    }
    if (reservation.status === "CANCELLED") {
      throw new AppError(400, "La reserva ya está cancelada");
    }

    const [showtime] = await db
      .select({ startTime: showtimes.startTime })
      .from(showtimes)
      .where(eq(showtimes.id, reservation.showtimeId))
      .limit(1);

    if (new Date(showtime!.startTime) <= new Date()) {
      throw new AppError(400, "No se puede cancelar una función que ya comenzó");
    }

    const [updated] = await reservationRepo.cancel(reservationId);
    return updated;
  },
};
