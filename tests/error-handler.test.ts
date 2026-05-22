import { test, expect } from "bun:test";
import { AppError } from "../src/lib/app-error";
import { errorHandler } from "../src/middleware/error-handler";
import type { NextFunction } from "express";

interface MockRes {
  statusCode: number;
  body: unknown;
  status(code: number): MockRes;
  json(data: unknown): MockRes;
}

function mockReq(): object {
  return {};
}

function mockRes(): MockRes {
  return {
    statusCode: 0,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
  };
}

test("AppError — status y message", () => {
  const err = new AppError(404, "No encontrado");
  expect(err.status).toBe(404);
  expect(err.message).toBe("No encontrado");
  expect(err).toBeInstanceOf(Error);
});

test("errorHandler — AppError responde con status y mensaje", () => {
  const err = new AppError(409, "Conflicto");
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req as any, res as any, {} as NextFunction);
  expect(res.statusCode).toBe(409);
  expect(res.body).toEqual({ error: "Conflicto" });
});

test("errorHandler — SyntaxError (JSON inválido) responde 400", () => {
  const err = new SyntaxError("Unexpected token");
  (err as any).body = undefined;
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req as any, res as any, {} as NextFunction);
  expect(res.statusCode).toBe(400);
  expect(res.body).toEqual({
    error: "JSON inválido en el cuerpo de la solicitud",
  });
});

test("errorHandler — error genérico responde 500", () => {
  const err = new Error("Algo salió mal");
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req as any, res as any, {} as NextFunction);
  expect(res.statusCode).toBe(500);
  expect(res.body).toEqual({ error: "Error interno del servidor" });
});
