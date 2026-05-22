import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "USER";
}

export const userRepo = {
  findByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).limit(1);
  },

  findById(id: number) {
    return db.select().from(users).where(eq(users.id, id)).limit(1);
  },

  create(data: CreateUserData) {
    return db.insert(users).values(data).returning();
  },
};
