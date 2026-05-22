import { movieRepo, type CreateMovieData } from "../repositories/movie.repo";
import { AppError } from "../lib/app-error";

export const movieService = {
  async create(data: CreateMovieData) {
    const movie = await movieRepo.create(data);
    const [result] = await movieRepo.findById(movie!.id);
    return result;
  },

  async update(id: number, data: Partial<CreateMovieData>) {
    const [existing] = await movieRepo.findById(id);
    if (!existing) throw new AppError(404, "Película no encontrada");

    const [result] = await movieRepo.update(id, data);
    return result;
  },

  async delete(id: number) {
    const [existing] = await movieRepo.findById(id);
    if (!existing) throw new AppError(404, "Película no encontrada");

    await movieRepo.delete(id);
  },

  findById(id: number) {
    return movieRepo.findById(id);
  },

  findAll(title?: string, category?: string, page = 1, limit = 20) {
    return movieRepo.findAll(
      {
        title,
        category: category ? Number(category) : undefined,
      },
      page,
      limit,
    );
  },
};
