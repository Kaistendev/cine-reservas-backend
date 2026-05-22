import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient, { schema });

async function seed() {
  console.log("Sembrando base de datos...");

  // Limpiar datos existentes
  await db.delete(schema.reservedSeats);
  await db.delete(schema.reservations);
  await db.delete(schema.showtimes);
  await db.delete(schema.seats);
  await db.delete(schema.screens);
  await db.delete(schema.movieCategories);
  await db.delete(schema.movies);
  await db.delete(schema.categories);
  await db.delete(schema.users);
  console.log("  Datos anteriores eliminados");

  // ─── Users ────────────────────────────────────────────────

  const pw = await bcrypt.hash("admin123", 10);
  const [admin] = await db
    .insert(schema.users)
    .values({ email: "admin@cine.com", passwordHash: pw, role: "ADMIN" })
    .returning();
  console.log("  Admin:", admin!.email);

  const [user] = await db
    .insert(schema.users)
    .values({ email: "user@cine.com", passwordHash: pw, role: "USER" })
    .returning();
  console.log("  User:", user!.email);

  // ─── Categories ───────────────────────────────────────────

  const [catAccion] = await db
    .insert(schema.categories)
    .values({ name: "Acción" })
    .returning();
  const [_catComedia] = await db
    .insert(schema.categories)
    .values({ name: "Comedia" })
    .returning();
  const [catDrama] = await db
    .insert(schema.categories)
    .values({ name: "Drama" })
    .returning();
  const [catSciFi] = await db
    .insert(schema.categories)
    .values({ name: "Ciencia Ficción" })
    .returning();
  console.log("  Categorías creadas");

  // ─── Movies ───────────────────────────────────────────────

  const [dune] = await db
    .insert(schema.movies)
    .values({
      title: "Dune: Parte Dos",
      description: "Paul Atreides se une a los Fremen para vengar a su familia.",
      posterUrl: "https://example.com/dune2.jpg",
      durationMinutes: 166,
    })
    .returning();
  await db.insert(schema.movieCategories).values([
    { movieId: dune!.id, categoryId: catAccion!.id },
    { movieId: dune!.id, categoryId: catDrama!.id },
    { movieId: dune!.id, categoryId: catSciFi!.id },
  ]);

  const [inception] = await db
    .insert(schema.movies)
    .values({
      title: "Inception",
      description: "Un ladrón especializado en extraer secretos del subconsciente.",
      posterUrl: "https://example.com/inception.jpg",
      durationMinutes: 148,
    })
    .returning();
  await db.insert(schema.movieCategories).values([
    { movieId: inception!.id, categoryId: catAccion!.id },
    { movieId: inception!.id, categoryId: catSciFi!.id },
  ]);
  console.log("  Películas creadas");

  // ─── Screens & Seats ──────────────────────────────────────

  const [sala1] = await db
    .insert(schema.screens)
    .values({ name: "Sala 1", totalCapacity: 20 })
    .returning();
  const rowsSala1 = ["A", "B", "C", "D"];
  const seatsSala1 = rowsSala1.flatMap((row) =>
    Array.from({ length: 5 }, (_, i) => ({
      screenId: sala1!.id,
      rowLetter: row,
      seatNumber: i + 1,
    }))
  );
  await db.insert(schema.seats).values(seatsSala1);
  console.log(`  ${seatsSala1.length} asientos en Sala 1`);

  const [sala2] = await db
    .insert(schema.screens)
    .values({ name: "Sala 2", totalCapacity: 12 })
    .returning();
  const rowsSala2 = ["A", "B", "C"];
  const seatsSala2 = rowsSala2.flatMap((row) =>
    Array.from({ length: 4 }, (_, i) => ({
      screenId: sala2!.id,
      rowLetter: row,
      seatNumber: i + 1,
    }))
  );
  await db.insert(schema.seats).values(seatsSala2);
  console.log(`  ${seatsSala2.length} asientos en Sala 2`);

  // ─── Showtimes ────────────────────────────────────────────

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(20, 0, 0, 0);

  const dayAfter = new Date(nextWeek);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const [st1] = await db
    .insert(schema.showtimes)
    .values({
      movieId: dune!.id,
      screenId: sala1!.id,
      startTime: nextWeek,
      ticketPrice: "12.50",
    })
    .returning();

  const [_st2] = await db
    .insert(schema.showtimes)
    .values({
      movieId: inception!.id,
      screenId: sala2!.id,
      startTime: dayAfter,
      ticketPrice: "10.00",
    })
    .returning();
  console.log("  Funciones creadas");

  // ─── Reservations ─────────────────────────────────────────

  const seatsSala1Ids = (
    await db
      .select({ id: schema.seats.id })
      .from(schema.seats)
      .where(eq(schema.seats.screenId, sala1!.id))
      .limit(3)
  ).map((s) => s.id);

  const ticketPrice = Number("12.50");
  const totalAmount = (ticketPrice * seatsSala1Ids.length).toFixed(2);

  const [reservation] = await db
    .insert(schema.reservations)
    .values({
      userId: user!.id,
      showtimeId: st1!.id,
      status: "ACTIVE",
      totalAmount,
    })
    .returning();

  await db.insert(schema.reservedSeats).values(
    seatsSala1Ids.map((seatId) => ({
      reservationId: reservation!.id,
      showtimeId: st1!.id,
      seatId,
      pricePaid: String(ticketPrice),
    }))
  );
  console.log(
    `  Reserva creada: ${seatsSala1Ids.length} asientos en ${dune!.title}`
  );

  console.log("\nSeed completado!");
  console.log("  Admin: admin@cine.com / admin123");
  console.log("  User:  user@cine.com / admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
