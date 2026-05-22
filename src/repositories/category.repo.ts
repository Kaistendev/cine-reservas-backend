import { db } from "../db";
import { categories } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { paginated, type PaginatedResult } from "../lib/pagination";

export const categoryRepo = {
  async findAll(page = 1, limit = 20): Promise<PaginatedResult<typeof categories.$inferSelect>> {
    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);

    const data = await db
      .select()
      .from(categories)
      .orderBy(categories.name)
      .limit(limit)
      .offset((page - 1) * limit);

    return paginated(data, Number(total?.count ?? 0), page, limit);
  },

  findById(id: number) {
    return db.select().from(categories).where(eq(categories.id, id)).limit(1);
  },

  create(name: string) {
    return db.insert(categories).values({ name }).returning();
  },

  update(id: number, name: string) {
    return db
      .update(categories)
      .set({ name })
      .where(eq(categories.id, id))
      .returning();
  },

  delete(id: number) {
    return db.delete(categories).where(eq(categories.id, id));
  },
};
