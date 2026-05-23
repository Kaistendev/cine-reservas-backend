import { test, expect } from "bun:test";
import request from "supertest";
import app from "../src/index";

test("POST /auth/register — email inválido (400)", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "no-es-un-email", password: "123456" });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Datos inválidos");
});

test("POST /auth/register — password vacío (400)", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "test@test.com", password: "" });
  expect(res.status).toBe(400);
});

test("POST /auth/register — body vacío (400)", async () => {
  const res = await request(app).post("/auth/register").send({});
  expect(res.status).toBe(400);
});

test("POST /auth/login — credenciales inválidas (400)", async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "", password: "" });
  expect(res.status).toBe(400);
});

test("POST /movies — body vacío sin auth (401)", async () => {
  const res = await request(app).post("/movies").send({});
  expect(res.status).toBe(401);
});

test("POST /movies — body sin campos requeridos con auth (400)", async () => {
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  const token = login.body.accessToken;

  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${token}`)
    .send({});
  expect(res.status).toBe(400);
});

test("POST /movies — solo title sin durationMinutes (400)", async () => {
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  const token = login.body.accessToken;

  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Test" });
  expect(res.status).toBe(400);
});

test("POST /screens — totalCapacity negativo (400)", async () => {
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  const token = login.body.accessToken;

  const res = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test", totalCapacity: -5 });
  expect(res.status).toBe(400);
});

test("POST /showtimes — ticketPrice negativo (400)", async () => {
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  const token = login.body.accessToken;

  const res = await request(app)
    .post("/showtimes")
    .set("Authorization", `Bearer ${token}`)
    .send({ movieId: 1, screenId: 1, startTime: new Date().toISOString(), ticketPrice: -10 });
  expect(res.status).toBe(400);
});

test("POST /reservations — seatIds vacío sin auth (401)", async () => {
  const res = await request(app)
    .post("/reservations")
    .send({ showtimeId: 1, seatIds: [] });
  expect(res.status).toBe(401);
});

test("GET /movies/abc — id param inválido (400)", async () => {
  const res = await request(app).get("/movies/abc");
  expect(res.status).toBe(400);
});

test("GET /categories/abc — id param inválido (400)", async () => {
  const res = await request(app).get("/categories/abc");
  expect(res.status).toBe(400);
});

test("GET /screens/abc — id param inválido (400)", async () => {
  const res = await request(app).get("/screens/abc");
  expect(res.status).toBe(400);
});
