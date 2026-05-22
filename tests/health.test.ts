import { test, expect } from "bun:test";
import request from "supertest";
import app from "../src/index";

test("GET /health — devuelve ok", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
  expect(res.body.timestamp).toBeDefined();
});
