import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

type Source = "body" | "params" | "query";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
      validatedParams?: Record<string, unknown>;
    }
  }
}

export function validate(schema: z.ZodType, source: Source = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({ message: "Datos inválidos" });
      return;
    }
    if (source === "query") {
      req.validatedQuery = result.data as Record<string, unknown>;
    }
    if (source === "params") {
      req.validatedParams = result.data as Record<string, unknown>;
      req.params = result.data as typeof req.params;
    }
    next();
  };
}
