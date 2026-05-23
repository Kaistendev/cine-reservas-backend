import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let movieId: number;
let screenId: number;
let createdId: number;

beforeAll(async () => {
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = adminRes.body.accessToken;

  const catRes = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ShowtimeCat-${Date.now()}` });
  const catId = catRes.body.id;

  const movieRes = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ title: `ShowtimeMovie-${Date.now()}`, durationMinutes: 90, categoryIds: [catId] });
  movieId = movieRes.body.id;

  const screenRes = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `ShowtimeScreen-${Date.now()}`, totalCapacity: 0 });
  screenId = screenRes.body.id;

  await request(app)
    .post(`/screens/${screenId}/seats`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ rows: 2, seatsPerRow: 3 });
});

test("GET /showtimes — listar público", async () => {
  const res = await request(app).get("/showtimes");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("POST /showtimes — admin crea función", async () => {
  const future = new Date();
  future.setDate(future.getDate() + 7);
  const res = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      movieId,
      screenId,
      startTime: future.toISOString(),
      ticketPrice: 15,
    });
  expect(res.status).toBe(201);
  createdId = res.body.id;
});

test("POST /showtimes — user no autorizado (403)", async () => {
  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  const token = userRes.body.accessToken;
  const future = new Date();
  future.setDate(future.getDate() + 7);

  const res = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${token}`)
    .send({ movieId, screenId, startTime: future.toISOString(), ticketPrice: 10 });
  expect(res.status).toBe(403);
});

test("GET /showtimes/:id/seats — disponibilidad", async () => {
  const res = await request(app).get(`/showtimes/${createdId}/seats`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty("status");
  expect(res.body.every((s: { status: string }) => s.status === "available")).toBe(true);
});

test("PUT /showtimes/:id — admin actualiza", async () => {
  const res = await request(app)
    .put(`/showtimes/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ ticketPrice: 20 });
  expect(res.status).toBe(200);
});

test("DELETE /showtimes/:id — admin elimina", async () => {
  const res = await request(app)
    .delete(`/showtimes/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(204);
});
