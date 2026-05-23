import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepo } from "../repositories/user.repo";
import { AppError } from "../lib/app-error";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

function generateTokens(payload: { userId: number; email: string; role: "ADMIN" | "USER" }) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(email: string, password: string) {
    const existing = await userRepo.findByEmail(email);
    if (existing.length > 0) {
      throw new AppError(409, "El email ya está registrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await userRepo.create({ email, passwordHash });

    const tokens = generateTokens({ userId: user!.id, email: user!.email, role: user!.role });

    return { ...tokens, user: { id: user!.id, email: user!.email, role: user!.role } };
  },

  async login(email: string, password: string) {
    const [user] = await userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(401, "Credenciales inválidas");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Credenciales inválidas");
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    return { ...tokens, user: { id: user.id, email: user.email, role: user.role } };
  },

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
        userId: number;
        email: string;
        role: "ADMIN" | "USER";
      };

      const [user] = await userRepo.findById(payload.userId);
      if (!user) {
        throw new AppError(401, "Usuario no encontrado");
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: ACCESS_EXPIRY }
      );

      return { accessToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(401, "Refresh token inválido o expirado");
    }
  },
};
