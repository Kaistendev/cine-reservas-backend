import { showtimeRepo } from "../repositories/showtime.repo";
import { screenRepo } from "../repositories/screen.repo";
import { movieRepo } from "../repositories/movie.repo";
import { AppError } from "../lib/app-error";

interface CreateShowtimeInput {
  movieId: number;
  screenId: number;
  startTime: string;
  ticketPrice: number;
}

export const showtimeService = {
  async create(data: CreateShowtimeInput) {
    const [movie] = await movieRepo.findById(data.movieId);
    if (!movie) throw new AppError(400, "Película no encontrada");

    const [screen] = await screenRepo.findById(data.screenId);
    if (!screen) throw new AppError(400, "Sala no encontrada");

    const [showtime] = await showtimeRepo.create({
      movieId: data.movieId,
      screenId: data.screenId,
      startTime: new Date(data.startTime),
      ticketPrice: String(data.ticketPrice),
    });

    return showtime;
  },

  async update(id: number, data: Partial<CreateShowtimeInput>) {
    const [existing] = await showtimeRepo.findById(id);
    if (!existing) throw new AppError(404, "Función no encontrada");

    const updateData: Record<string, unknown> = {};
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.ticketPrice) updateData.ticketPrice = String(data.ticketPrice);
    if (data.movieId) updateData.movieId = data.movieId;
    if (data.screenId) updateData.screenId = data.screenId;

    const [showtime] = await showtimeRepo.update(id, updateData);
    return showtime;
  },

  async delete(id: number) {
    const [existing] = await showtimeRepo.findById(id);
    if (!existing) throw new AppError(404, "Función no encontrada");

    await showtimeRepo.delete(id);
  },

  findAll(filters?: { movie_id?: number; date?: string }, page = 1, limit = 20) {
    return showtimeRepo.findAll(filters, page, limit);
  },

  async findById(id: number) {
    const [result] = await showtimeRepo.findWithDetails(id);
    if (!result) throw new AppError(404, "Función no encontrada");
    return result;
  },

  async getSeats(showtimeId: number) {
    const seats = await showtimeRepo.getSeatAvailability(showtimeId);
    if (!seats) throw new AppError(404, "Función no encontrada");
    return seats;
  },
};
