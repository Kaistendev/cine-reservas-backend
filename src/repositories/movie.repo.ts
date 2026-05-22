import { db } from "../db";
import { movies, categories, movieCategories } from "../db/schema";
import { eq, like, and, sql } from "drizzle-orm";
import { paginated, type PaginatedResult } from "../lib/pagination";

export interface CreateMovieData {
  title: string;
  description?: string | null;
  posterUrl?: string | null;
  durationMinutes: number;
  categoryIds?: number[];
}

interface MovieRow {
  id: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  durationMinutes: number;
  categories: { id: number; name: string }[];
}

export const movieRepo = {
  async create(data: CreateMovieData) {
    const { categoryIds, ...movieData } = data;
    const [movie] = await db.insert(movies).values(movieData).returning();

    if (categoryIds && categoryIds.length > 0) {
      await db.insert(movieCategories).values(
        categoryIds.map((categoryId) => ({ movieId: movie!.id, categoryId }))
      );
    }

    return movie;
  },

  async update(id: number, data: Partial<CreateMovieData>) {
    const { categoryIds, ...movieData } = data;

    if (Object.keys(movieData).length > 0) {
      await db.update(movies).set(movieData).where(eq(movies.id, id));
    }

    if (categoryIds !== undefined) {
      await db.delete(movieCategories).where(eq(movieCategories.movieId, id));
      if (categoryIds.length > 0) {
        await db.insert(movieCategories).values(
          categoryIds.map((categoryId) => ({ movieId: id, categoryId }))
        );
      }
    }

    return movieRepo.findById(id);
  },

  delete(id: number) {
    return db.delete(movies).where(eq(movies.id, id));
  },

  findById(id: number) {
    return db
      .select({
        id: movies.id,
        title: movies.title,
        description: movies.description,
        posterUrl: movies.posterUrl,
        durationMinutes: movies.durationMinutes,
        categories: sql<
          { id: number; name: string }[]
        >`COALESCE(json_agg(json_build_object('id', ${categories.id}, 'name', ${categories.name})) FILTER (WHERE ${categories.id} IS NOT NULL), '[]')`,
      })
      .from(movies)
      .leftJoin(movieCategories, eq(movieCategories.movieId, movies.id))
      .leftJoin(categories, eq(categories.id, movieCategories.categoryId))
      .where(eq(movies.id, id))
      .groupBy(movies.id)
      .limit(1);
  },

  async findAll(
    filters?: { title?: string; category?: number },
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<MovieRow>> {
    const conditions: ReturnType<typeof like>[] = [];
    if (filters?.title) {
      conditions.push(like(movies.title, `%${filters.title}%`));
    }

    const query = db
      .select({
        id: movies.id,
        title: movies.title,
        description: movies.description,
        posterUrl: movies.posterUrl,
        durationMinutes: movies.durationMinutes,
        categories: sql<
          { id: number; name: string }[]
        >`COALESCE(json_agg(json_build_object('id', ${categories.id}, 'name', ${categories.name})) FILTER (WHERE ${categories.id} IS NOT NULL), '[]')`,
      })
      .from(movies)
      .leftJoin(movieCategories, eq(movieCategories.movieId, movies.id))
      .leftJoin(categories, eq(categories.id, movieCategories.categoryId))
      .groupBy(movies.id)
      .$dynamic();

    if (filters?.category) {
      query.having(sql`bool_or(${categories.id} = ${filters.category})`);
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const data = await query
      .orderBy(movies.title)
      .limit(limit)
      .offset((page - 1) * limit);

    const countSub = db
      .select({ id: movies.id })
      .from(movies)
      .leftJoin(movieCategories, eq(movieCategories.movieId, movies.id))
      .leftJoin(categories, eq(categories.id, movieCategories.categoryId))
      .groupBy(movies.id)
      .$dynamic();

    if (filters?.category) {
      countSub.having(sql`bool_or(${categories.id} = ${filters.category})`);
    }

    if (conditions.length > 0) {
      countSub.where(and(...conditions));
    }

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(countSub.as("sub"));

    return paginated(data, Number(totalRow?.count ?? 0), page, limit);
  },
};
