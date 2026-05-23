import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let userToken: string;
let adminToken: string;
let showtimeId: number;
let seatIds: number[] = [];
let createdId: number;

beforeAll(async () => {
  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  userToken = userRes.body.accessToken;

  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = adminRes.body.accessToken;

  const catRes = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ResCat-${Date.now()}` });
  const catId = catRes.body.id;

  const movieRes = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ title: `ResMovie-${Date.now()}`, durationMinutes: 90, categoryIds: [catId] });
  const movieId = movieRes.body.id;

  const screenRes = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ResScreen-${Date.now()}`, totalCapacity: 0 });
  const screenId = screenRes.body.id;

  await request(app)
    .post(`/screens/${screenId}/seats`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ rows: 2, seatsPerRow: 3 });

  const screenDetail = await request(app).get(`/screens/${screenId}`);
  seatIds = screenDetail.body.seats.map((s: { id: number }) => s.id);

  const future = new Date();
  future.setDate(future.getDate() + 7);
  const stRes = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ movieId, screenId, startTime: future.toISOString(), ticketPrice: 15 });
  showtimeId = stRes.body.id;
});

test("POST /reservations — sin auth (401)", async () => {
  const res = await request(app)
    .post("/reservations")
    .send({ showtimeId, seatIds: [seatIds[0]] });
  expect(res.status).toBe(401);
});

test("POST /reservations — crear reserva", async () => {
  const res = await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ showtimeId, seatIds: [seatIds[0], seatIds[1]] });
  expect(res.status).toBe(201);
  expect(res.body.reservation.status).toBe("ACTIVE");
  expect(res.body.seats).toHaveLength(2);
  createdId = res.body.reservation.id;
});

test("POST /reservations — mismo asiento (409)", async () => {
  const res = await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ showtimeId, seatIds: [seatIds[0]] });
  expect(res.status).toBe(409);
});

test("POST /reservations — función no existe (404)", async () => {
  const res = await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ showtimeId: 99999, seatIds: [seatIds[2]] });
  expect(res.status).toBe(404);
});

test("GET /reservations — historial del usuario", async () => {
  const res = await request(app)
    .get("/reservations")
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThanOrEqual(1);
});

test("PATCH /reservations/:id/cancel — otro usuario (403)", async () => {
  const res = await request(app)
    .patch(`/reservations/${createdId}/cancel`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(403);
});

test("PATCH /reservations/:id/cancel — cancelar", async () => {
  const res = await request(app)
    .patch(`/reservations/${createdId}/cancel`)
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("CANCELLED");
});

test("PATCH /reservations/:id/cancel — ya cancelada (400)", async () => {
  const res = await request(app)
    .patch(`/reservations/${createdId}/cancel`)
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(400);
});
