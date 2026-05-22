import { db } from "../db";
import { screens, seats } from "../db/schema";
import { eq } from "drizzle-orm";

export const screenRepo = {
  findAll() {
    return db.select().from(screens).orderBy(screens.name);
  },

  findById(id: number) {
    return db.select().from(screens).where(eq(screens.id, id)).limit(1);
  },

  create(data: { name: string; totalCapacity: number }) {
    return db.insert(screens).values(data).returning();
  },

  update(id: number, data: Partial<{ name: string; totalCapacity: number }>) {
    return db
      .update(screens)
      .set(data)
      .where(eq(screens.id, id))
      .returning();
  },

  delete(id: number) {
    return db.delete(screens).where(eq(screens.id, id));
  },

  getSeats(screenId: number) {
    return db
      .select()
      .from(seats)
      .where(eq(seats.screenId, screenId))
      .orderBy(seats.rowLetter, seats.seatNumber);
  },

  generateSeats(screenId: number, rows: number, seatsPerRow: number) {
    const rowLetters = Array.from({ length: rows }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    const seatsData = rowLetters.flatMap((row) =>
      Array.from({ length: seatsPerRow }, (_, i) => ({
        screenId,
        rowLetter: row,
        seatNumber: i + 1,
      }))
    );
    return db.insert(seats).values(seatsData).returning();
  },
};
