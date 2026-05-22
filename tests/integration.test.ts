import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let userToken: string;
let categoryId: number;
let movieId: number;
let screenId: number;
let showtimeId: number;
let reservationId: number;

beforeAll(async () => {
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = adminRes.body.token;

  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  userToken = userRes.body.token;
});

test("1. Crear categoría", async () => {
  const res = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Integración-${Date.now()}` });
  expect(res.status).toBe(201);
  categoryId = res.body.id;
});

test("2. Crear película con categoría", async () => {
  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: `Película Integración-${Date.now()}`,
      durationMinutes: 120,
      categoryIds: [categoryId],
    });
  expect(res.status).toBe(201);
  expect(res.body.categories).toHaveLength(1);
  movieId = res.body.id;
});

test("3. Crear sala", async () => {
  const res = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Sala Integración-${Date.now()}`, totalCapacity: 0 });
  expect(res.status).toBe(201);
  screenId = res.body.id;
});

test("4. Generar asientos en la sala", async () => {
  const res = await request(app)
    .post(`/screens/${screenId}/seats`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ rows: 3, seatsPerRow: 4 });
  expect(res.status).toBe(201);
  expect(res.body.seatsCreated).toBe(12);
});

test("5. Ver sala con asientos", async () => {
  const res = await request(app).get(`/screens/${screenId}`);
  expect(res.status).toBe(200);
  expect(res.body.seats).toHaveLength(12);
  expect(res.body.totalCapacity).toBe(12);
});

test("6. Crear función (showtime)", async () => {
  const future = new Date();
  future.setDate(future.getDate() + 7);
  const res = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      movieId,
      screenId,
      startTime: future.toISOString(),
      ticketPrice: 15.5,
    });
  expect(res.status).toBe(201);
  showtimeId = res.body.id;
});

test("7. Ver disponibilidad de asientos", async () => {
  const res = await request(app).get(`/showtimes/${showtimeId}/seats`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(12);
  expect(res.body.every((s: { status: string }) => s.status === "available")).toBe(true);
});

test("8. Usuario reserva 3 asientos", async () => {
  const seatsRes = await request(app).get(`/showtimes/${showtimeId}/seats`);
  const seatIds = seatsRes.body.slice(0, 3).map((s: { id: number }) => s.id);

  const res = await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ showtimeId, seatIds });
  expect(res.status).toBe(201);
  expect(res.body.seats).toHaveLength(3);
  reservationId = res.body.reservation.id;
});

test("9. Ver historial de reservas del usuario", async () => {
  const res = await request(app)
    .get("/reservations")
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(1);
  expect(res.body.some((r: { id: number }) => r.id === reservationId)).toBe(true);
});

test("10. Cancelar reserva", async () => {
  const res = await request(app)
    .patch(`/reservations/${reservationId}/cancel`)
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("CANCELLED");
});

test("11. Ver reporte de ingresos", async () => {
  const res = await request(app)
    .get("/admin/reports/revenue")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("total");
  expect(res.body).toHaveProperty("byMovie");
});

test("12. Ver reporte de ocupación", async () => {
  const res = await request(app)
    .get("/admin/reports/occupancy")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  if (res.body.length > 0) {
    expect(res.body[0]).toHaveProperty("occupancyPct");
  }
});

test("13. Ver detalle financiero de película", async () => {
  const res = await request(app)
    .get(`/admin/reports/movies/${movieId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("movie");
  expect(res.body).toHaveProperty("summary");
  expect(res.body).toHaveProperty("showtimes");
});

test("14. Paginación en GET /movies", async () => {
  const res = await request(app).get("/movies?page=1&limit=5");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("data");
  expect(res.body).toHaveProperty("total");
  expect(res.body).toHaveProperty("page", 1);
  expect(res.body).toHaveProperty("limit", 5);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("15. Paginación en GET /categories", async () => {
  const res = await request(app).get("/categories?page=1&limit=10");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("data");
  expect(res.body).toHaveProperty("page", 1);
});
