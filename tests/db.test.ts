import { test, expect } from "bun:test";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

test("Base de datos — conexión y ping", async () => {
  const result = await db.execute(sql`SELECT 1 AS ping`);
  expect(result).toBeDefined();
  expect(result.length).toBeGreaterThanOrEqual(1);
});
