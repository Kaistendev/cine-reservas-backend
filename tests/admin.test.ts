import { test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../src/index";

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  adminToken = adminRes.body.accessToken;

  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@cine.com", password: "admin123" });
  userToken = userRes.body.accessToken;
});

test("GET /admin/reservations — sin auth (401)", async () => {
  const res = await request(app).get("/admin/reservations");
  expect(res.status).toBe(401);
});

test("GET /admin/reservations — user no autorizado (403)", async () => {
  const res = await request(app)
    .get("/admin/reservations")
    .set("Authorization", `Bearer ${userToken}`);
  expect(res.status).toBe(403);
});

test("GET /admin/reservations — admin ve todas las reservas", async () => {
  const res = await request(app)
    .get("/admin/reservations")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
