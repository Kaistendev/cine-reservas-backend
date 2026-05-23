import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let userToken: string;
let categoryId: number;
let createdId: number;

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
    .send({ name: `MovieTestCat-${Date.now()}` });
  categoryId = catRes.body.id;
});

test("GET /movies — listar", async () => {
  const res = await request(app).get("/movies");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("GET /movies/:id — 404", async () => {
  const res = await request(app).get("/movies/99999");
  expect(res.status).toBe(404);
});

test("POST /movies — sin auth (401)", async () => {
  const res = await request(app)
    .post("/movies")
    .send({ title: "Test", durationMinutes: 90 });
  expect(res.status).toBe(401);
});

test("POST /movies — user no autorizado (403)", async () => {
  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ title: "Test", durationMinutes: 90 });
  expect(res.status).toBe(403);
});

test("POST /movies — admin crea", async () => {
  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: `TestMovie-${Date.now()}`,
      durationMinutes: 120,
      categoryIds: [categoryId],
    });
  expect(res.status).toBe(201);
  expect(res.body.title).toInclude("TestMovie");
  expect(res.body.categories).toHaveLength(1);
  createdId = res.body.id;
});

test("GET /movies/:id — detalle", async () => {
  const res = await request(app).get(`/movies/${createdId}`);
  expect(res.status).toBe(200);
  expect(res.body.id).toBe(createdId);
});

test("PUT /movies/:id — admin actualiza", async () => {
  const res = await request(app)
    .put(`/movies/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ title: "Updated Movie" });
  expect(res.status).toBe(200);
  expect(res.body.title).toBe("Updated Movie");
});

test("DELETE /movies/:id — admin elimina", async () => {
  const res = await request(app)
    .delete(`/movies/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(204);
});
