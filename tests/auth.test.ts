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

test("POST /auth/register — crear usuario", async () => {
  const email = `test-${Date.now()}@test.com`;
  const res = await request(app)
    .post("/auth/register")
    .send({ email, password: "123456" });
  expect(res.status).toBe(201);
  expect(res.body.accessToken).toBeDefined();
  expect(res.body.user.email).toBe(email);
});

test("POST /auth/register — email duplicado", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "admin@cine.com", password: "123456" });
  expect(res.status).toBe(409);
});

test("POST /auth/login — credenciales inválidas", async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "no@existe.com", password: "x" });
  expect(res.status).toBe(401);
});

test("POST /auth/register — validación falla", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "invalido" });
  expect(res.status).toBe(400);
});

test("GET /me — sin token", async () => {
  const res = await request(app).get("/me");
  expect(res.status).toBe(401);
});

test("GET /me — con token válido", async () => {
  const res = await request(app)
    .get("/me")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.user.email).toBe("admin@cine.com");
});

test("POST /auth/login — devuelve accessToken y refreshToken", async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  expect(res.status).toBe(200);
  expect(res.body.accessToken).toBeDefined();
  expect(res.body.refreshToken).toBeDefined();
  expect(res.body.user).toBeDefined();
});

test("POST /auth/refresh — renueva access token", async () => {
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@cine.com", password: "admin123" });
  const refreshToken = login.body.refreshToken;

  const res = await request(app)
    .post("/auth/refresh")
    .send({ refreshToken });
  expect(res.status).toBe(200);
  expect(res.body.accessToken).toBeDefined();
  expect(typeof res.body.accessToken).toBe("string");
});

test("POST /auth/refresh — refresh token inválido (401)", async () => {
  const res = await request(app)
    .post("/auth/refresh")
    .send({ refreshToken: "token-invalido" });
  expect(res.status).toBe(401);
});

test("POST /auth/refresh — body vacío (400)", async () => {
  const res = await request(app)
    .post("/auth/refresh")
    .send({});
  expect(res.status).toBe(400);
});
