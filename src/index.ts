import "./lib/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./lib/env";
import authRoutes from "./routes/auth.routes";
import movieRoutes from "./routes/movie.routes";
import categoryRoutes from "./routes/category.routes";
import screenRoutes from "./routes/screen.routes";
import showtimeRoutes from "./routes/showtime.routes";
import reservationRoutes from "./routes/reservation.routes";
import reportRoutes from "./routes/report.routes";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { authorize } from "./middleware/rbac";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

const isTest = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => isTest,
  message: { message: "Demasiados intentos, intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const reservationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  skip: () => isTest,
  message: { message: "Demasiadas reservas por minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/auth", authLimiter, authRoutes);
app.use("/movies", movieRoutes);
app.use("/categories", categoryRoutes);
app.use("/screens", screenRoutes);
app.use("/showtimes", showtimeRoutes);
app.use("/reservations", reservationLimiter, reservationRoutes);

app.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.use("/admin/reports", authenticate, authorize("ADMIN"), reportRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

if (Bun.main === import.meta.path) {
  app.listen(env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  });
}

export default app;
