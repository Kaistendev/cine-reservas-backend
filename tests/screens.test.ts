import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let createdId: number;

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = res.body.accessToken;
});

test("GET /screens — listar", async () => {
  const res = await request(app).get("/screens");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("GET /screens/:id — 404", async () => {
  const res = await request(app).get("/screens/99999");
  expect(res.status).toBe(404);
});

test("POST /screens — admin crea", async () => {
  const res = await request(app)
    .post("/screens")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Screen-${Date.now()}`, totalCapacity: 0 });
  expect(res.status).toBe(201);
  createdId = res.body.id;
});

test("POST /screens/:id/seats — generar asientos", async () => {
  const res = await request(app)
    .post(`/screens/${createdId}/seats`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ rows: 3, seatsPerRow: 4 });
  expect(res.status).toBe(201);
  expect(res.body.seatsCreated).toBe(12);
  expect(res.body.totalCapacity).toBe(12);
});

test("GET /screens/:id — con asientos", async () => {
  const res = await request(app).get(`/screens/${createdId}`);
  expect(res.status).toBe(200);
  expect(res.body.seats).toHaveLength(12);
});

test("PUT /screens/:id — admin actualiza", async () => {
  const res = await request(app)
    .put(`/screens/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Updated-${Date.now()}` });
  expect(res.status).toBe(200);
});

test("DELETE /screens/:id — admin elimina", async () => {
  const res = await request(app)
    .delete(`/screens/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(204);
});
