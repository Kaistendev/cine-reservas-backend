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

test("GET /categories — listar", async () => {
  const res = await request(app).get("/categories");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("POST /categories — admin crea", async () => {
  const res = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Cat-${Date.now()}` });
  expect(res.status).toBe(201);
  createdId = res.body.id;
});

test("POST /categories — sin auth (401)", async () => {
  const res = await request(app)
    .post("/categories")
    .send({ name: "NoAuth" });
  expect(res.status).toBe(401);
});

test("POST /categories — user no autorizado (403)", async () => {
  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  const token = userRes.body.accessToken;

  const res = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "NoPerm" });
  expect(res.status).toBe(403);
});

test("PUT /categories/:id — admin actualiza", async () => {
  const res = await request(app)
    .put(`/categories/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: `Updated-${Date.now()}` });
  expect(res.status).toBe(200);
});

test("DELETE /categories/:id — admin elimina", async () => {
  const res = await request(app)
    .delete(`/categories/${createdId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(204);
});
