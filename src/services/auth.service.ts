import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepo } from "../repositories/user.repo";
import { AppError } from "../lib/app-error";

export const authService = {
  async register(email: string, password: string) {
    const existing = await userRepo.findByEmail(email);
    if (existing.length > 0) {
      throw new AppError(409, "El email ya está registrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await userRepo.create({ email, passwordHash });

    const token = jwt.sign(
      { userId: user!.id, email: user!.email, role: user!.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return { token, user: { id: user!.id, email: user!.email, role: user!.role } };
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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  },
};
