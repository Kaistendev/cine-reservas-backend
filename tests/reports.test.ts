import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let userToken: string;
let movieId: number;

beforeAll(async () => {
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = adminRes.body.accessToken;

  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  userToken = userRes.body.accessToken;

  const catRes = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ReportCat-${Date.now()}` });
  const catId = catRes.body.id;

  const movieRes = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ title: `ReportMovie-${Date.now()}`, durationMinutes: 100, categoryIds: [catId] });
  movieId = movieRes.body.id;

  const screenRes = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ReportScreen-${Date.now()}`, totalCapacity: 0 });
  const screenId = screenRes.body.id;

  const seatsRes = await request(app)
    .post(`/screens/${screenId}/seats`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ rows: 2, seatsPerRow: 4 });
  const seatIds = seatsRes.body.seats.map((s: { id: number }) => s.id);

  const future = new Date();
  future.setDate(future.getDate() + 7);
  const stRes = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ movieId, screenId, startTime: future.toISOString(), ticketPrice: 10 });
  const showtimeId = stRes.body.id;

  await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ showtimeId, seatIds: [seatIds[0], seatIds[1], seatIds[2]] });
});

test("GET /admin/reports/revenue — user no autorizado (403)", async () => {
  const res = await request(app)
    .get("/admin/reports/revenue")
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(403);
});

test("GET /admin/reports/revenue — admin", async () => {
  const res = await request(app)
    .get("/admin/reports/revenue")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.total).toBeDefined();
  expect(res.body.byMovie).toBeDefined();
  expect(Array.isArray(res.body.byMovie)).toBe(true);
});

test("GET /admin/reports/occupancy — admin", async () => {
  const res = await request(app)
    .get("/admin/reports/occupancy")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("GET /admin/reports/movies/:id — admin", async () => {
  const res = await request(app)
    .get(`/admin/reports/movies/${movieId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.movie).toBeDefined();
  expect(res.body.summary).toBeDefined();
  expect(res.body.showtimes).toBeDefined();
});
