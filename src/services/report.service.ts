import { reportRepo } from "../repositories/report.repo";
import { AppError } from "../lib/app-error";

export const reportService = {
  revenue(from?: string, to?: string) {
    return reportRepo.revenue(from, to);
  },

  occupancy(filters?: { movie_id?: number; from?: string; to?: string }) {
    return reportRepo.occupancy(filters);
  },

  async movieDetail(movieId: number) {
    const result = await reportRepo.movieDetail(movieId);
    if (!result) throw new AppError(404, "Película no encontrada");
    return result;
  },
};
