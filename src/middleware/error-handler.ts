import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/app-error";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "JSON inválido en el cuerpo de la solicitud" });
    return;
  }

  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
}
