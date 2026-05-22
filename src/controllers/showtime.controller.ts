import { type Request, type Response, type NextFunction } from "express";
import { showtimeService } from "../services/showtime.service";

export const showtimeController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await showtimeService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.validatedQuery as {
        movie_id?: number;
        date?: string;
        page: number;
        limit: number;
      };
      const filters = {
        ...(q.movie_id ? { movie_id: q.movie_id } : {}),
        ...(q.date ? { date: q.date } : {}),
      };
      const result = await showtimeService.findAll(filters, q.page, q.limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const showtime = await showtimeService.findById(id);
      res.json(showtime);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const result = await showtimeService.update(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      await showtimeService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const seats = await showtimeService.getSeats(id);
      res.json(seats);
    } catch (err) {
      next(err);
    }
  },
};
